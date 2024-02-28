# Indexfondsenvergelijken.nl

A website that compares the costs and characteristics of index funds, ETF's, banks and brokers in the Netherlands.
Available at https://www.indexfondsenvergelijken.nl/

## Development

The source code for this website is written in [TypeScript](https://www.typescriptlang.org/) and built
with [Astro](https://astro.build/).
The data is stored in JSON files in the [`data/`](data/) directory.

### Required software

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Node.js](https://nodejs.org/en/download/)

### Getting started

Clone this repository and run `npm install` inside the project directory to install dependencies.
Run `npm runn dev` to build and run the site.
Open a browser and go to http://localhost:4321 to view the website.

### Tests

Unit tests are written with [Jest](https://jestjs.io/). Execute `npm test` to run them.

### Deployment

A new site is automatically built and deployed to Cloudflare Pages when new commits are pushed to the `master` branch.
