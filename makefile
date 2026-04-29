.PHONY: help
help: makefile
	@tail -n +4 makefile | grep ".PHONY"


node_modules: package.json bun.lock
	if test ! -d $@; then bun install; fi


.PHONY: build
build: node_modules
	bunx tsc


.PHONY: start
start: node_modules
	bun app.ts


.PHONY: dev
dev: node_modules
	bun --watch app.ts


.PHONY: test
test: build
