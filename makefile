.PHONY: help
help: makefile
	@tail -n +4 makefile | grep ".PHONY"


node_modules: package.json bun.lock
	if test ! -d $@; then bun install; fi


.PHONY: build
build: node_modules
	bun run vite build


.PHONY: start
start: build
	NODE_ENV=production bun app.ts


.PHONY: dev
dev: node_modules
	NODE_ENV=development bun --watch app.ts


.PHONY: typecheck
typecheck: node_modules
	bunx tsc -p tsconfig.json
	bunx tsc -p tsconfig.client.json


.PHONY: test
test: typecheck build
