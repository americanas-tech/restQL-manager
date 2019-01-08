[![Build Status](https://travis-ci.org/B2W-BIT/restQL-manager.svg?branch=new-routes)](https://travis-ci.org/B2W-BIT/restQL-manager)

## Running restQL Manager

restQL Manager allows you to easily develop and test new queries, save resources endpoints, check resources status and save queries that can be used by clients just referencing the query's name.

restQL Manager requires a [restQL-http](https://github.com/B2W-BIT/restQL-http) running instance.

## Installation

### NPM

**restQL Manager** can be installed with [`@b2wdigital/restql-manager`](https://www.npmjs.com/package/@b2wdigital/restql-manager) npm package and run it directely from the shell.

```shell
$ npm i -g @b2wdigital/restql-manager
$ restql-manager
```

### Docker

The official **restQL Manager** docker image can be pulled from `b2wdigital/restql-manager` repository.

#### Basic usage:
```shell
$ docker run -p 9000:9000 b2wdigital/restql-manager:latest
```

#### Custom configuration:
```shell
$ docker run -p 8080:8080 -e RESTQL_MANAGER_PORT=8080 ... b2wdigital/restql-manager:latest
```

## Configuration

restQL Manager uses the following environment variables for its configuration:

- `RESTQL_SERVER_URL`. This **MUST** point to a running [restQL-http](https://github.com/B2W-BIT/restQL-http) instance
- `RESTQL_MANAGER_PORT`. Default is `3000`. Set this variable to change the TCP port to be bound.
- `MONGO_URL`. This should point to the same mongoDB instances used by the referenced [restQL-http](https://github.com/B2W-BIT/restQL-http).


## Development server


To install restQL manager dependecies run:

```shell
yarn install
```

To start the development server, run:

```shell
yarn server:start
```

In another shell, run:

```shell
yarn start
```

Access http://localhost:5000/.


# Production build

To build a production bundle, run:

```shell
yarn build
```

You can now start the server:

```shell
node src/server
```

restQL-manager will be available at `http://localhost:3000/`

