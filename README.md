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

To add a site, give it a directory like the one above, prefix its services and network with its slug (`caos-cs-*`), and add its `compose.yaml` to the root `include:` list. How it deploys stays in its own Makefile.

Open course materials may be placed here from time-to-time as well.
