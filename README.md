Passport-verify-stub-relying-party
==================================

GOV.UK Verify provides a federation of Identity Providers that Government services can use to verify the identity of their users.

This is an application that has been built to demonstrate how a Relying Party (Government Service) can build a web service using node.js, that uses the [Verify Service Provider](...) microservice to communicate with
GOV.UK Verify's Hub.

The purpose of this demonstration is to show that the complexity of producing and handling the SAML messages has been encapsulated within the Verify Service Provider
which in turn should make connecting to GOV.UK much simpler, quicker and therefore cheaper.

This node.js application uses the Express framework and the [Passport](https://www.npmjs.com/package/passport) identification middleware.

The GOV.UK Verify team has also built and published an appropriate Passport Strategy [passport-verify](https://www.npmjs.com/package/passport-verify) that simplifies
with the intention of this being used in conjunction with above as the simplest way to connect to GOV.UK Verify.

Build status
------------
[![Build Status](https://travis-ci.org/alphagov/passport-verify-stub-relying-party.svg?branch=master)](https://travis-ci.org/alphagov/passport-verify-stub-relying-party)

Pre-requisites
--------------
NodeJs

Docker/Java8 JRE (for running an instance of the Verify Service Provider and [Matching Service Adapter](https://alphagov.github.io/rp-onboarding-tech-docs/pages/msa/msaUse.html))

Please see the appropriate documentation for configuring and deploying the Verify Service Provider and Matching Service Adapter

Installation
------------

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

For the unit tests run:
```
npm run test
```

To run the full suite of tests, please see the [Acceptance Test documentation](/docs/Running_acceptance_Tests.md)

For development of passport-verify node module
----------------------------------------------
In order to run the service using a locally linked copy of 'passport-verify' typescript has a bug that duplicates
dependencies, to get around this, the following dependencies need to be removed.

```
rm -r node_modules/@types/passport-strategy/
rm -r node_modules/@types/passport/
```
