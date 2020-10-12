all: dist/index.html

dist/%: node_modules
	node_modules/.bin/webpack --mode=production

node_modules: package-lock.json
	npm install

clean:
	rm -rf dist/*
