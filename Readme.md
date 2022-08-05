This repo contains code for creating a NFT Marketplace just like OpenSea.
It has two sections for frontend and backend detailed below.

# Nft-Marketplace frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.



# Nft-Marketplace backend

The Project is created in NodeJS v16.0.0 using Sequqlize ORM model for mysql.

It maintains the records localy and provides all Apis to the Application frontend.

## Development server

Run `npm run dev` for a dev server. Get/Post Apis to `http://localhost:3000/`. The app will automatically reload if you change any of the source files.

## Production

Run `node server.js` to start the server, or use pm2 process for monitoring the process.