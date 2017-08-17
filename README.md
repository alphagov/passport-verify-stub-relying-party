Passport-verify-stub-relying-party
==================================

[![Build Status](https://travis-ci.org/alphagov/passport-verify-stub-relying-party.svg?branch=master)](https://travis-ci.org/alphagov/passport-verify-stub-relying-party)

Usage
-----

passport-verify-stub-relying-party uses `yarn` to manage dependencies. See https://yarnpkg.com/en/

Install the dependencies with:

```
yarn install
```

Run the tests with:

```
./pre-commit.sh
```

Start the application with:

```
./startup.sh
```

Run acceptance-tests with:

```
npm run acceptance-tests
```

Alternatively, to do the above pointing at the verify-service-provider-dev instance on paas, use:

```
npm run pre-commit-paas
npm run startup-paas
npm run acceptance-tests-paas
```

In order to run the service using a locally linked copy of 'passport-verify' typescript has a bug that duplicates 
dependencies, to get around this, the following dependencies need to be removed.

```
rm -r node_modules/@types/passport-strategy/
rm -r node_modules/@types/passport/
```
