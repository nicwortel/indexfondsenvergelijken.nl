# Indexfondsenvergelijken.nl

![Build status](https://github.com/nicwortel/indexfondsenvergelijken.nl/workflows/Build/badge.svg)

A website that compares the costs and characteristics of index funds, ETF's, banks and brokers in the Netherlands.
Available at https://www.indexfondsenvergelijken.nl/

## Development

The source code for this website is written in [TypeScript](https://www.typescriptlang.org/) and built
with [Webpack](https://webpack.js.org/).
The data is stored in JSON files in the [`data/`](data/) directory.

### Required software

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Node.js](https://nodejs.org/en/download/) & [Yarn](https://yarnpkg.com/)

Optional, but recommended:

- [GNU Make](https://www.gnu.org/software/make/)
- [Docker](https://docs.docker.com/install/) &
  [Docker Compose](https://docs.docker.com/compose/install/)

### Getting started

Clone this repository and run `make` inside the project directory to install dependencies and build the website.
Run `docker-compose up -d` to build and run the Docker container.

If you cannot run `make` on your system, manually run `yarn install` and
`node_modules/.bin/webpack --mode=development`.

If you don't have Docker and Docker Compose installed, instead run `yarn serve`
to run a simple web server.

### Tests

Unit tests are written with [Jest](https://jestjs.io/). Execute `yarn test` to run them.

### Deployment

A new Docker image is automatically built and deployed to Kubernetes when new commits are pushed to the `master` branch.
