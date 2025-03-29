# Another one Nextjs template

## Dev Usage
Bun should be installed on your system

0) Run `cp env-example .env` and adjust the env variables (if needed)
1) Run `bun install` to install all deps
2) Run `docker compose -f compose-dev.yml up --build` to start up all needed services (DB, Queue, etc)
3) Run `bun migrate:dev` to apply all migrations
4) Run `bun dev` to start the dev server

To acess to the running DB you can use the appropriate script: `bash ./scripts/dev/enter-db.sh`

## Prod Usage

1) ...