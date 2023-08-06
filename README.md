<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest.js Framework Logo" />
  </a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">
  A <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.
</p>
<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
  <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>


## Description

[Nest](https://github.com/nestjs/nest) framework repository for TypeScript.


## Installation

```bash
$ nvm use v14.17.4
$ nvm use v14.18.3

npm install -g yarn && \
rm -rf node_modules package-lock.json && \
yarn add -D \
  @nestjs/cli @nestjs/schematics \
  @nestjs/testing \
  @types/node \
  @types/express \
  @types/cron \
  @types/jest \
  @types/supertest \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint \
  eslint-config-prettier \
  eslint-plugin-prettier \
  jest prettier source-map-support supertest \
  ts-jest \
  ts-loader \
  ts-node \
  tsconfig-paths \
  typescript && \
ls -la node_modules/.bin/ && \
npm run start;
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Database configuration

- Do not forgot to configure the Mongodb srv (whether it is pointed on `*-test`, `*-prod`)

<br>
<br>

---

<br>
<br>

## Heroku Deployment

- check heroku-cli
    * `heroku update`
    * `heroku login`
- run `npm run build` command in order to obtain the dist build.
    - run `yarn run build`
- copy the main `package.json` file and paste it in the obtained `./dist` folder:  `cp package-dist.json /dist/package.json`
- In the scripts section, delete the commands: `prebuild`, `build`, `format`, `start:dev`, `start:debug`, `start:prod`
- In `start` script, rename it with `node main`
- Make a [`Procfile`](https://devcenter.heroku.com/articles/getting-started-with-nodejs?singlepage=true#define-a-procfile) with command `web: node main.js`
    * `echo 'web: node main.js' >  ./dist/Procfile`
- Add the heroku git url:
    * `heroku git:remote -a zion-backend`
    * `heroku git:remote --app zion-backend`  > prod
    * `heroku apps:info zion-backend`
    * `heroku git:remote -a zion-staging`     > staging
    * `heroku apps:info zion-staging`
    * `heroku git:remote https://git.heroku.com/zion-backend.git`
    * `heroku git:remote https://git.heroku.com/zion-staging.git`
- Push the dist directory to heroku,
    * `cd ./dist/`
    * `git init . && git branch -m main`
    * `heroku git:remote --app zion-staging`
    * `git remote add heroku https://git.heroku.com/zion-staging.git`
    * `heroku push .`
    * `git push heroku main`
- Check the dyno status: `heroku ps`
- Reference:
    * [devcenter.heroku.com/articles/nodejs-support](https://devcenter.heroku.com/articles/nodejs-support)
    * [github.com/heroku/heroku-buildpack-nodejs](https://github.com/heroku/heroku-buildpack-nodejs)


<br>
<br>

---

<br>
<br>


## License

Nest is [MIT licensed](LICENSE).
