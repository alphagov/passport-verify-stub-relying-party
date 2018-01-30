Passport-verify-stub-relying-party
==================================

Passport-verify-stub-relying-party is a Node.js application built to demonstrate how a government service connecting to GOV.UK Verify can build a Node.js service that uses the [Verify Service Provider](https://github.com/alphagov/verify-service-provider) to communicate with the Verify Hub. 

This application uses:
* [Express framework](https://expressjs.com/) 
* [Passport.js](https://www.npmjs.com/package/passport) identification middleware
* [passport-verify](https://github.com/alphagov/passport-verify) package

For more information about connecting to Verify, refer to:

* [Verify Service Provider](https://github.com/alphagov/verify-service-provider)
* [main technical documentation for connecting to Verify](http://alphagov.github.io/rp-onboarding-tech-docs/index.html)

Build status
------------
[![Build Status](https://travis-ci.org/alphagov/passport-verify-stub-relying-party.svg?branch=master)](https://travis-ci.org/alphagov/passport-verify-stub-relying-party)

Pre-requisites
--------------
To use Passport-verify-stub-relying-party, you must have:

* Node.js
* Docker
* Java8 JRE 

You must also configure and deploy:

* [Verify Service Provider](https://github.com/alphagov/verify-service-provider)
* [Matching Service Adapter](http://alphagov.github.io/rp-onboarding-tech-docs/pages/msa/msa.html)

Installation
------------

passport-verify-stub-relying-party uses `yarn` to manage dependencies. See the [yarn documentation](https://yarnpkg.com/en/) for more information. 

Install the dependencies with:

```
yarn install
```

Note: There is a preinstall script that prevents `npm install` from being run.  A consequnce of this is that yarn install cannot be chained with any other npm tasks, meaning `yarn install` cannot be incorporated into an npm script such as `npm build` or `npm startup`.


Start the application with defaults:
------------------------------------

```
npm run startup
```

This will invoke the following default values for configuration:

* ENTITY_ID: `null`
* VERIFY_SERVICE_PROVIDER_HOST: `http://localhost:50400`
* DATABASE_CONNECTION_STRING: `postgesql://localhost:5432/stub_rp_test` (intended for connecting to a local postgres docker container defined by [db.Dockerfile](db.DockerFile)

Testing
-------

For the unit tests run:
```
npm run test
```

To run the full suite of tests, refer to the [acceptance test documentation](/docs/development/Running_Acceptance_Tests.md)

For development of passport-verify node module
----------------------------------------------
If you want to run the service using a locally linked copy of 'passport-verify', be aware that TypeScript has a bug that duplicates dependencies. To get around this,  remove the following dependencies.

```
rm -r node_modules/@types/passport-strategy/
rm -r node_modules/@types/passport/
```
