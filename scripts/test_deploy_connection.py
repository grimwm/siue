"""Tests that websites/www.cs/deploy.sh logs in once.

Runs the real script against fake ssh, scp, sftp and sshpass executables
placed first on PATH; nothing here can reach a real host. The fakes log their
argv. Run: python3 -I scripts/test_deploy_connection.py
"""
import json
import os
import subprocess
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEPLOY = os.path.join(ROOT, "websites", "www.cs", "deploy.sh")
HOST = "nobody@host.invalid"

# Every fake appends its name and argv (one JSON line) to $FAKE_LOG.
LOGGER = (
    '#!/usr/bin/env python3\n'
    'import json, os, sys\n'
    'with open(os.environ["FAKE_LOG"], "a") as f:\n'
    '    f.write(json.dumps([os.path.basename(sys.argv[0])] + sys.argv[1:]) + "\\n")\n'
)

FAKES = {
    # The deploy's local checks (generators, npm) are not under test.
    "php": "#!/bin/sh\nexit 0\n",
    "npm": "#!/bin/sh\nexit 0\n",
    "node": "#!/bin/sh\nexit 0\n",
    # sshpass -f FILE cmd...: log itself, then run the command.
    "sshpass": LOGGER + 'os.execvp(sys.argv[3], sys.argv[3:])\n',
    "ssh": LOGGER
    + 'a = sys.argv[1:]\n'
    + 'if "ControlMaster=yes" in a and os.environ.get("FAKE_MASTER_FAIL"):\n'
    + '    sys.stderr.write("ssh: connect to host: Connection refused\\n")\n'
    + '    sys.exit(255)\n',
    # scp keeps what it uploads in $FAKE_REMOTE, so the stamp read after the
    # upload sees the stamp the deploy wrote (or a corrupted one, on request).
    "scp": LOGGER
    + 'import shutil\n'
    + 'src, dst = sys.argv[-2], sys.argv[-1]\n'
    + 'remote = os.environ["FAKE_REMOTE"]\n'
    + 'if ":" in dst:\n'
    + '    shutil.copy(src, os.path.join(remote, os.path.basename(dst.split(":", 1)[1])))\n'
    + '    if os.environ.get("FAKE_STAMP_CORRUPT") and dst.endswith(":.deploy-hash"):\n'
    + '        open(os.path.join(remote, ".deploy-hash"), "w").write("sha256 0\\n")\n'
    + '    sys.exit(0)\n'
    + 'held = os.path.join(remote, os.path.basename(src.split(":", 1)[1]))\n'
    + 'if not os.path.exists(held):\n'
    + '    sys.stderr.write("scp: .deploy-hash: No such file or directory\\n")\n'
    + '    sys.exit(1)\n'
    + 'shutil.copy(held, dst)\n',
    "sftp": LOGGER
    + 'if os.environ.get("FAKE_SFTP_FAIL"):\n'
    + '    sys.exit(1)\n'
    + 'if "-" in sys.argv:\n'
    + '    sys.stdin.read()\n'
    + '    print("games/cylon/data/scores.json")\n',
}


class DeployConnectionTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.bin = os.path.join(self.tmp.name, "bin")
        os.mkdir(self.bin)
        for name, body in FAKES.items():
            path = os.path.join(self.bin, name)
            with open(path, "w") as f:
                f.write(body)
            os.chmod(path, 0o755)
        self.log = os.path.join(self.tmp.name, "log")
        open(self.log, "w").close()
        self.passfile = os.path.join(self.tmp.name, "pass")
        with open(self.passfile, "w") as f:
            f.write("not-a-real-password\n")
        self.tmpdir = os.path.join(self.tmp.name, "tmp")
        os.mkdir(self.tmpdir)
        self.remote = os.path.join(self.tmp.name, "remote")
        os.mkdir(self.remote)

    def tearDown(self):
        self.tmp.cleanup()

    def deploy(self, **extra):
        env = {
            **os.environ,
            "PATH": self.bin + os.pathsep + os.environ["PATH"],
            "FAKE_LOG": self.log,
            "HOST": HOST,
            "SSHPASS_FILE": self.passfile,
            "TMPDIR": self.tmpdir,
            "FAKE_REMOTE": self.remote,
            "STUDIO_CONFIG": '{"people":[]}',
            **extra,
        }
        return subprocess.run(["bash", DEPLOY], capture_output=True, text=True, env=env, timeout=300)

    def calls(self):
        with open(self.log) as f:
            return [json.loads(line) for line in f if line.strip()]

    def assert_rides_master(self, call):
        self.assertIn("ControlMaster=no", call, call)
        self.assertTrue(any(a.startswith("ControlPath=") for a in call), call)

    def test_one_login_everything_else_rides_the_master(self):
        r = self.deploy()
        self.assertEqual(r.returncode, 0, r.stderr)
        calls = self.calls()
        names = [c[0] for c in calls]

        self.assertEqual(names.count("sshpass"), 1, calls)
        masters = [c for c in calls if c[0] == "ssh" and "ControlMaster=yes" in c]
        self.assertEqual(len(masters), 1, calls)
        self.assertEqual(calls[0][0], "sshpass", "the master is the first command")
        self.assertIn("-fN", masters[0])
        self.assertIn("ControlPersist=no", masters[0])
        self.assertEqual(masters[0][-1], HOST)

        transfers = [c for c in calls if c[0] in ("scp", "sftp")]
        # stamp read, uploads, scores listing, scores chmod, stamp write, stamp read back
        self.assertGreaterEqual(len(transfers), 6, calls)
        for c in transfers:
            self.assert_rides_master(c)
        self.assertEqual(len([c for c in transfers if c[0] == "scp"]), 3, calls)

        socks = {a for c in masters + transfers for a in c if a.startswith("ControlPath=")}
        self.assertEqual(len(socks), 1, "all share one socket")

        self.assertEqual(calls[-1][0], "ssh", calls[-1])
        self.assertIn("-O", calls[-1])
        self.assertIn("exit", calls[-1])
        self.assertEqual(names.count("ssh"), 2, "master plus -O exit")
        self.assertIn("deployed", r.stdout)

    def test_socket_path_is_short_and_removed(self):
        self.assertEqual(self.deploy().returncode, 0)
        sock = next(a for c in self.calls() for a in c if a.startswith("ControlPath="))
        path = sock.split("=", 1)[1]
        self.assertLess(len(path), 60, path)
        self.assertFalse(os.path.exists(os.path.dirname(path)))
        self.assertEqual(os.listdir(self.tmpdir), [])

    def test_a_stamp_that_does_not_match_fails_on_the_same_login(self):
        r = self.deploy(FAKE_STAMP_CORRUPT="1")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("does not hold", r.stderr)
        self.assertEqual([c[0] for c in self.calls()].count("sshpass"), 1)

    def test_master_exits_when_a_later_step_fails(self):
        r = self.deploy(FAKE_SFTP_FAIL="1")
        self.assertNotEqual(r.returncode, 0)
        calls = self.calls()
        self.assertEqual([c[0] for c in calls].count("sshpass"), 1, calls)
        self.assertEqual(calls[-1][0], "ssh", calls[-1])
        self.assertIn("exit", calls[-1])
        self.assertIn("-O", calls[-1])

    def test_failed_master_stops_with_one_message_and_no_retry(self):
        r = self.deploy(FAKE_MASTER_FAIL="1")
        self.assertNotEqual(r.returncode, 0)
        self.assertIn(
            f"could not connect to {HOST}; not retrying — repeated logins trip the server's fail2ban",
            r.stderr,
        )
        calls = self.calls()
        self.assertEqual([c[0] for c in calls], ["sshpass", "ssh"], calls)
        self.assertEqual(os.listdir(self.tmpdir), [])


if __name__ == "__main__":
    unittest.main()
