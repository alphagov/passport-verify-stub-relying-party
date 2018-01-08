Passport-verify-stub-relying-party
==================================

An application that has been built to demonstrate how a Relying Party can build a service using the 'passport-verify' node package to interact with the Verify Service Provider

[![Build Status](https://travis-ci.org/alphagov/passport-verify-stub-relying-party.svg?branch=master)](https://travis-ci.org/alphagov/passport-verify-stub-relying-party)

Pre-requisites
--------------
NodeJs

Docker

Usage
-----

passport-verify-stub-relying-party uses `yarn` to manage dependencies. See https://yarnpkg.com/en/

Install the dependencies with:

```
yarn install
```

Start the application with:

```
npm run startup [--paas]
```

Note : use the ```--paas``` flag to run against the verify-service-provider-dev instance on paas.
Otherwise it will use the value of the VERIFY_SERVICE_PROVIDER_HOST environment variable, defaulting to `http://localhost:50400`.

Testing
-------

To run the acceptance tests locally we need both the Verify Service Provider, and an instance of Postgres to be running.

The Verify Service Provider has to be started manually and must be configured with an EntityID of `http://verify-service-provider-dev-service`.

A Postgres container is built as part of the pre-commit script.

Run the unit and acceptance tests with:

```
./pre-commit.sh
```

Acceptance-tests could be run against PAAS instance of Verify Service Provider however needs an instance of appropriate postgres database running:

```
npm run acceptance-tests --paas
```

For development of passport-verify node module
----------------------------------------------
In order to run the service using a locally linked copy of 'passport-verify' typescript has a bug that duplicates
dependencies, to get around this, the following dependencies need to be removed.

```
rm -r node_modules/@types/passport-strategy/
rm -r node_modules/@types/passport/
```
