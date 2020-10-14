WEBPACK_FLAGS = --mode=development

all: dist/index.html

dist/%: src/* src/*/* node_modules index.html
	node_modules/.bin/webpack $(WEBPACK_FLAGS)

.PHONY: dist
dist: WEBPACK_FLAGS = --mode=production
dist: dist/index.html

.PHONY: watch
watch: WEBPACK_FLAGS += --watch
watch:
	node_modules/.bin/webpack $(WEBPACK_FLAGS)

node_modules: package-lock.json
	npm install

clean:
	rm -rf dist/*
