WEBPACK_FLAGS = --mode=development

all: dist/index.html dist/veelgestelde-vragen.html

dist/%: assets/* assets/*/* data/* node_modules src/* src/*/* templates/ index.html veelgestelde-vragen.html webpack.config.js
	node_modules/.bin/webpack $(WEBPACK_FLAGS)

.PHONY: dist
dist: WEBPACK_FLAGS = --mode=production
dist: dist/index-prod.html

.PHONY: watch
watch: WEBPACK_FLAGS += --watch
watch:
	node_modules/.bin/webpack $(WEBPACK_FLAGS)

node_modules: yarn.lock
	yarn install

clean:
	rm -rf dist/*
