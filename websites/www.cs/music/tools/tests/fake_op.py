#!/usr/bin/env python3
"""A stand-in for the 1Password CLI (op v2) in tests. Items live in the JSON
file $FAKE_OP_STORE; every argv is appended to $FAKE_OP_LOG, so a test can
prove no secret ever rode on a command line."""
import json
import os
import sys
import uuid


def load():
    path = os.environ["FAKE_OP_STORE"]
    if not os.path.exists(path):
        return {"items": []}
    with open(path) as f:
        return json.load(f)


def save(data):
    with open(os.environ["FAKE_OP_STORE"], "w") as f:
        json.dump(data, f)


def flag(args, name):
    return args[args.index(name) + 1] if name in args else None


def main(argv):
    with open(os.environ["FAKE_OP_LOG"], "a") as log:
        log.write(json.dumps(argv) + "\n")
    if argv == ["--version"]:
        print(os.environ.get("FAKE_OP_VERSION", "2.30.0"))
        return 0
    data = load()
    vault = flag(argv, "--vault")
    if argv[:2] == ["item", "list"]:
        tag = flag(argv, "--tags")
        print(json.dumps([{"id": i["id"], "title": i["title"], "tags": i["tags"]}
                          for i in data["items"] if i["vault"] == vault and tag in i["tags"]]))
        return 0
    if argv[:2] == ["item", "get"]:
        for i in data["items"]:
            if i["id"] == argv[2] and i["vault"] == vault:
                hide = "--reveal" not in argv
                fields = [{**f, "value": "[use 'op item get --reveal']"} if hide and f["type"] == "CONCEALED" else f for f in i["fields"]]
                print(json.dumps({**i, "fields": fields}))
                return 0
        print(f'[ERROR] "{argv[2]}" isn\'t an item in the "{vault}" vault', file=sys.stderr)
        return 1
    if argv[:2] == ["item", "create"] and argv[-1] == "-":
        t = json.load(sys.stdin)
        fields = t["fields"]
        if os.environ.get("FAKE_OP_MANGLE"):  # a store that keeps a different shape than was sent
            fields = [{**f, "label": "x_" + f["label"]} for f in fields]
        item = {"id": uuid.uuid4().hex[:26], "vault": vault, "title": t["title"], "category": t["category"],
                "tags": t.get("tags", []), "fields": fields, "urls": t.get("urls", [])}
        data["items"].append(item)
        save(data)
        print(json.dumps({"id": item["id"]}))
        return 0
    if argv[:2] == ["item", "edit"]:
        for i in data["items"]:
            if i["id"] == argv[2] and i["vault"] == vault:
                i["title"] = flag(argv, "--title") or i["title"]
        save(data)
        return 0
    if argv[:2] == ["item", "delete"] and "--archive" in argv:
        data["items"] = [i for i in data["items"] if i["id"] != argv[2]]
        save(data)
        return 0
    print("fake op: unsupported: " + " ".join(argv), file=sys.stderr)
    return 2


sys.exit(main(sys.argv[1:]))
