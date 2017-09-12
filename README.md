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
npm run pre-commit [--paas]
```

Start the application with:

```
npm run startup [--paas]
```

Run acceptance-tests with:

```
npm run acceptance-tests [--paas]
```

For each of the above, use the ```--paas``` flag to run against the verify-service-provider-dev instance on paas. Otherwise it will use the value of the VERIFY_SERVICE_PROVIDER_HOST environment variable, defaulting to a local one.

In order to run the service using a locally linked copy of 'passport-verify' typescript has a bug that duplicates
dependencies, to get around this, the following dependencies need to be removed.

```
rm -r node_modules/@types/passport-strategy/
rm -r node_modules/@types/passport/
```
