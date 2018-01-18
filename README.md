Passport-verify-stub-relying-party
==================================

Passport-verify-stub-relying-party is a Node.js application built to demonstrate how a government service connecting to GOV.UK Verify can build a Node.js service that uses the [Verify Service Provider](https://github.com/alphagov/verify-service-provider) to communicate with the Verify Hub. 

This application uses the Express framework and the [Passport](https://www.npmjs.com/package/passport) identification middleware.

For more information, refer to:

* [Verify Service Provider](https://github.com/alphagov/verify-service-provider)
* [Passport.js strategy](https://www.npmjs.com/package/passport-verify)
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

Start the application with:

```
npm run startup [--paas]
```

Note : use the ```--paas``` flag to run against the verify-service-provider-dev instance on GOV.UK Platform as a Service (PaaS). Otherwise the application will use the value of the VERIFY_SERVICE_PROVIDER_HOST environment variable, defaulting to `http://localhost:50400`.

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
