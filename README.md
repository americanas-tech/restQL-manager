[![Build Status](https://travis-ci.org/B2W-BIT/restQL-manager.svg?branch=new-routes)](https://travis-ci.org/B2W-BIT/restQL-manager)

Talk with other restQL users in our Telegram groups:

* [@restQL](https://t.me/restQL): restQL Telegram Group
* [@restQLBR](https://t.me/restQLBR): Brazilian restQL Telegram Group

## Running restQL Manager

restQL Manager allows you to easily develop and test new queries, save resources endpoints, check resources status and save queries that can be used by clients just referencing the query's name.

restQL Manager requires a [restQL-server](https://github.com/B2W-BIT/restQL-server) running instance.

## Installation

restQL Manager is available through npm, and can be installed with `npm install -g restql-manager`

Once installed, you can simply run `restql-manager` from the shell and it will start.

## Configuration

restQL Manager uses the following environment variables for its configuration:

- **RESTQL_SERVER_URL**. This **MUST** point to a running [restQL-server](https://github.com/B2W-BIT/restQL-server) instance
- **RESTQL_MANAGER_PORT**. Default is 3000. Set this variable to change the TCP port to be bound.
- **MONGO_URL**. This should point to the same mongoDB instances used by the referenced [restQL-server](https://github.com/B2W-BIT/restQL-server).


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

