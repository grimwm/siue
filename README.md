# SIUE CS Page Materials

As an Instructor of Computer Science at Southern Illinois University Edwardsville, I maintain a collection of webpages and tools here. Each website lives under `websites/<host>/` with its own Makefile, which knows how that site deploys (`www.cs` goes to www.cs.siue.edu over scp and nowhere else), and its own `compose.yaml` and `docker/` for running it locally on the same stack its server has.

```
.
├── compose.yaml          # includes every site's compose.yaml
├── Makefile              # make up | down | ps | urls | parity, for all sites
└── websites
    └── www.cs
        ├── compose.yaml  # www-cs-* services
        ├── docker/       # images + checks that they match the server
        ├── Makefile      # make deploy, plus up | down | url | parity for this site
        └── ...
```

`make deploy` (or `make deploy SITE=www.cs`) deploys each site to its own server. A deploy stages exactly what the server receives (git's view of the working tree, uncommitted edits included, ignored files left out), hashes it with `scripts/deploy-hash`, and compares that with the `.deploy-hash` the site keeps on its server: equal means nothing to do, otherwise only changed files go up. `DRY_RUN=1` shows the plan; `FORCE=1` sends everything; `LIST=1` (www.cs) prints the deploy set and stops.

To add a site, give it a directory like the one above, prefix its services and network with its slug (`caos-cs-*`), and add its `compose.yaml` to the root `include:` list. How it deploys stays in its own Makefile.

Open course materials may be placed here from time-to-time as well.
