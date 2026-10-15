"""Tests that an e2e run's browsers never outlive it.

Runs the real tests/e2e/run.sh against fake npm and npx executables; the
fake npx starts "browsers" (sleep processes whose argv carries a profile path)
the way Playwright does, under the run's TMPDIR. Nothing here starts a real
browser or touches one. Run: python3 -I scripts/test_e2e_reap.py
"""
import os
import signal
import subprocess
import tempfile
import time
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E2E = os.path.join(ROOT, "websites", "www.cs", "tests", "e2e")
RUN = os.path.join(E2E, "run.sh")
REAP = os.path.join(E2E, "reap.sh")

# A process whose command line is `fake-browser --user-data-dir=<tag>`.
def spawn(tag):
    return subprocess.Popen(
        ["bash", "-c", 'exec -a "fake-browser --user-data-dir=$0" sleep 300', tag],
        start_new_session=True,
    )


def read(path):
    with open(path) as f:
        return f.read().strip()


def alive(p):
    return p.poll() is None


def wait_dead(p, secs=5):
    try:
        p.wait(timeout=secs)
        return True
    except subprocess.TimeoutExpired:
        return False


class ReapTest(unittest.TestCase):
    def setUp(self):
        self.procs = []
        self.tmp = tempfile.mkdtemp(prefix="siue-reap-test.")

    def tearDown(self):
        for p in self.procs:
            if alive(p):
                p.kill()
            p.wait()
        subprocess.run(["rm", "-rf", self.tmp])

    def fake(self, tag):
        p = spawn(tag)
        self.procs.append(p)
        time.sleep(0.3)  # let exec -a take effect
        return p

    def test_reap_kills_this_runs_browsers_only(self):
        mine = os.path.join(self.tmp, "siue-e2e-run.AAAAAA")
        other = os.path.join(self.tmp, "siue-e2e-run.BBBBBB")
        a = self.fake(mine + "/playwright_chromiumdev_profile-1")
        b = self.fake(mine + "/playwright_webkitdev_profile-2")
        concurrent = self.fake(other + "/playwright_chromiumdev_profile-3")
        users_own = self.fake("/Users/someone/Library/Application Support/Google/Chrome")
        r = subprocess.run(["bash", "-c", f'. "{REAP}"; e2e_reap_dir "{mine}"'])
        self.assertEqual(r.returncode, 0)
        self.assertTrue(wait_dead(a) and wait_dead(b), "this run's browsers are killed")
        self.assertTrue(alive(concurrent), "another run's browser survives")
        self.assertTrue(alive(users_own), "an untagged browser survives")

    def test_reap_refuses_a_non_path(self):
        survivor = self.fake("anything")
        for bad in ("", "relative"):
            r = subprocess.run(["bash", "-c", f'. "{REAP}"; e2e_reap_dir "{bad}"'], capture_output=True)
            self.assertNotEqual(r.returncode, 0, bad)
        self.assertTrue(alive(survivor))

    def run_script(self, sig):
        """Start run.sh with a fake Playwright that launches a browser, signal it."""
        bin_dir = os.path.join(self.tmp, "bin")
        os.mkdir(bin_dir)
        pidfile = os.path.join(self.tmp, "browser.pid")
        with open(os.path.join(bin_dir, "npm"), "w") as f:
            f.write("#!/bin/sh\nexit 0\n")
        with open(os.path.join(bin_dir, "npx"), "w") as f:
            f.write(
                "#!/bin/bash\n"
                'bash -c \'exec -a "fake-browser --user-data-dir=$0/playwright_chromiumdev_profile-x" sleep 300\' "$TMPDIR" &\n'
                f'echo $! > "{pidfile}"\n'
                "wait\n"
            )
        for n in ("npm", "npx"):
            os.chmod(os.path.join(bin_dir, n), 0o755)
        lock = os.path.join(self.tmp, "lock")
        env = dict(os.environ, PATH=bin_dir + os.pathsep + os.environ["PATH"], E2E_LOCK=lock, TMPDIR=self.tmp)
        run = subprocess.Popen(["bash", RUN], env=env, start_new_session=True)
        self.procs.append(run)
        for _ in range(100):
            if os.path.exists(pidfile) and read(pidfile):
                break
            time.sleep(0.1)
        else:
            self.fail("fake playwright never started")
        time.sleep(0.4)
        browser = int(read(pidfile))
        bystander = self.fake(os.path.join(self.tmp, "not-this-run", "profile"))
        if sig is None:
            return run, browser, bystander, lock, True
        os.kill(run.pid, sig)
        self.assertTrue(wait_dead(run, 10), "run.sh exits after the signal")
        return run, browser, bystander, lock, False

    def pid_gone(self, pid):
        for _ in range(50):
            try:
                os.kill(pid, 0)
            except ProcessLookupError:
                return True
            except PermissionError:
                return False
            # A zombie (reparented, unreaped) still answers kill 0; check state.
            st = subprocess.run(["ps", "-o", "stat=", "-p", str(pid)], capture_output=True, text=True).stdout.strip()
            if not st or st.startswith("Z"):
                return True
            time.sleep(0.1)
        return False

    def test_signals_kill_the_browser_and_free_the_lock(self):
        for sig in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP):
            with self.subTest(sig=sig.name):
                run, browser, bystander, lock, _ = self.run_script(sig)
                self.assertTrue(self.pid_gone(browser), "the browser does not outlive the run")
                self.assertTrue(alive(bystander), "an untagged process survives")
                self.assertFalse(os.path.exists(lock), "the lock is released")
                self.assertEqual([d for d in os.listdir(self.tmp) if d.startswith("siue-e2e-run.")], [])
                bystander.kill()
                bystander.wait()
                for f in ("bin", "browser.pid"):
                    subprocess.run(["rm", "-rf", os.path.join(self.tmp, f)])


if __name__ == "__main__":
    unittest.main()
