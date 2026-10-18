"""`siue-music setup`: the one guided command. Every step checks what is already done and skips it, so it can be run again."""
import re
from typing import Callable
from urllib.parse import urlencode

from .api import Api, ApiError
from .keys import (PICKUP_KEY, PICKUP_SCOPES, PUBLISH_KEY, PUBLISH_SCOPES, Keys, KeyMismatch, KeysError,
                   api_problem, is_misnamed, probe_states)
from .op import OpError

_API_KEY = re.compile(r"[0-9a-f]{64}")
MAX_PASTES = 5
ROLES = ((PUBLISH_KEY, PUBLISH_SCOPES), (PICKUP_KEY, PICKUP_SCOPES))


class SetupAbort(Exception):
    """A step cannot go on; the message says what to do. Exit code 1."""


class Setup:
    def __init__(self, keys: Keys, make_api: Callable[[str], Api], secret: Callable[[str], str],
                 open_url: Callable[[str], bool], out: Callable[[str], None] = print):
        self.keys = keys
        self.make_api = make_api
        self.secret = secret
        self.open_url = open_url
        self.out = out
        self.done: list[str] = []

    # -- 1Password and the two API keys

    def _check_op(self) -> None:
        try:
            self.keys.op.check_version()
            self.keys.op.list_items("siue-music-key")
        except OpError as e:
            raise SetupAbort(f"1Password is not ready: {e}. Install it with `brew install 1password-cli`, turn on "
                             "the 1Password app's CLI integration and sign in, then run make music-setup again.") from None

    def _refile(self, secrets: dict[str, str], states: dict[str, dict[str, str]]) -> None:
        """Keys saved under the wrong name are saved again under the right one (both, when they are swapped), and only
        then are the wrongly named items archived, so a stop half-way never loses a key."""
        moves = [(wrong, right) for wrong, right in ((PICKUP_KEY, PUBLISH_KEY), (PUBLISH_KEY, PICKUP_KEY))
                 if wrong in secrets and is_misnamed(wrong, states[wrong])
                 and (right not in secrets or api_problem(right, states[right]) is not None)]
        if not moves:
            return
        old_names = {name for move in moves for name in move}
        old_ids = [item_id for item_id, name in self.keys._api_items() if name in old_names]
        moved = {right: (secrets[wrong], states[wrong]) for wrong, right in moves}
        for wrong, right in moves:
            self.out(f"The key saved as {wrong} is really the {right} key: filing it under that name.")
            self.keys.api_item_add(right, secrets[wrong])
        for item_id in old_ids:
            self.keys.op.archive(item_id)
        for wrong, _ in moves:
            secrets.pop(wrong, None)
            states.pop(wrong, None)
        for right, (secret, state) in moved.items():
            secrets[right], states[right] = secret, state

    def _api_keys(self) -> None:
        secrets = self.keys.api_secrets()
        states = {name: probe_states(self.make_api(secret)) for name, secret in secrets.items()}
        self._refile(secrets, states)
        for name, scopes in ROLES:
            problem = api_problem(name, states[name]) if name in secrets else None
            if name in secrets and problem is None:
                self.out(f"The {name} API key is saved and works.")
            else:
                if problem:
                    self.out(problem + " Let's make a new one.")
                self._create_api_key(name, scopes)
            self.done.append(f"{name} API key saved")
        self.keys.pull()

    def hub_form_url(self, name: str, scopes: tuple[str, ...]) -> str:
        return self.keys.hub_url() + "keys.php?" + urlencode({"label": name, "scopes": ",".join(scopes)}, safe=",:")

    def _create_api_key(self, name: str, scopes: tuple[str, ...]) -> None:
        url = self.hub_form_url(name, scopes)
        use = "publishes drafts and the locked copy of your key" if name == PUBLISH_KEY else "picks up your notes"
        self.out(f"The {name} API key ({use}) is made on the admin hub; the form is filled in for you: {url}")
        if not self.open_url(url):
            self.out("Open that address in a browser and sign in.")
        for _ in range(MAX_PASTES):
            try:
                pasted = self.secret("In the browser, press Create key, then copy the key from \"Your new key\" and paste it here: ").strip()
            except EOFError:
                raise SetupAbort("No key was pasted. Run make music-setup again when you have it.") from None
            if not _API_KEY.fullmatch(pasted):
                self.out("That is not an API key (it is 64 letters and digits, shown once under \"New key\"). Try again.")
                continue
            states = probe_states(self.make_api(pasted))
            problem = api_problem(name, states)
            if problem:
                self.out(problem.replace("The " + name + " API key", "That key") + " Make sure the right boxes are ticked, then try again.")
                continue
            self.keys.api_key_set(name, pasted)
            return
        raise SetupAbort(f"No working {name} key after {MAX_PASTES} tries. Run make music-setup again.")

    # -- the notes key and its locked copy

    def _notes_key(self) -> None:
        keys = self.keys
        api = self.make_api(keys.api_key(PUBLISH_KEY))
        if keys.ensure_key(api):
            self.done.append("notes key made and saved in 1Password")
        else:
            self.out("1Password already holds a notes key; using it.")
            self.done.append("notes key found in 1Password")
        if keys.server_holds_ours(api):
            self.out("The server already holds the locked copy of this key and the earlier ones.")
        else:
            count = keys.upload_keyring(api)
            self.out(f"Uploaded the locked copy of your notes key ({count} key{'' if count == 1 else 's'}) to the server.")
        self.done.append("locked copy on the server, its current key checked")

    # -- the whole run

    def run_all(self) -> int:
        try:
            self._check_op()
            self._api_keys()
            self._notes_key()
        except SetupAbort as e:
            self.out(str(e))
            return 1
        except KeyMismatch as e:
            self.out(str(e))
            return 3
        except (KeysError, OpError, ApiError) as e:
            self.out(str(e))
            return 1
        self.out("\nDone:")
        for line in self.done:
            self.out(f"  ✓ {line}")
        self.out(f"\nNext: open the workroom, {self.keys.base}, and leave a note. Pick it up with make music-pickup.")
        return 0
