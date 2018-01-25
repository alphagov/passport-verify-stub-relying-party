## Passport Verify Stub Relying Party - Acceptance tests

Running the end to end acceptance tests requires:

* the Node.js application
* a database
* a [Verify Service Provider (VSP)](https://github.com/alphagov/verify-service-provider)
* a [Matching Service Adapater (MSA)](https://github.com/alphagov/verify-matching-service-adapter)
* the [Compliance Tool](https://verify-compliance-tool-ui.cloudapps.digital/)

In order to run the tests in a consistent way (locally, on Travis and on Jenkins), we have used Docker to spin up local containers for the Node.js app, database and VSP.

The [VSP container](/vsp.Dockerfile) is based on the v1.0.0 release of the VSP and is configured to:

* retrieve the necessary metadata from a MSA running on [GOV.UK PaaS](https://www.cloud.service.gov.uk/)
* send and receive SAML messages from and to the Compliance Tool running on the reference environment

The [database container](/db.Dockerfile) is a default postgres image, configured with a schema
that matches the [example local matching service](http://github.com/alphagov/verify-local-matching-service-example)

**WARNING**: care must be taken to ensure this hard coded schema is kept up to date with the example local matching service

## Dependencies:

The configuration for these tests currently relies on:
* the Compliance Tool hosted in the reference environment
* the Matching Service Adapter hosted on PaaS

## Running the tests locally

the `pre-commit.sh` script starts the vsp and db containers and exposes them on ports 50400 and 5432 respectively
so that the acceptance can be run from source.

## Travis and Jenkins

docker-compose is used to start the required components in the Travis and Jenkins Workspaces to avoid any
conflicts with port numbers.  These steps can be run locally.

To start these containers:
```
docker-compose up [-d]
```

To run the tests (or any npm scripts):
```
docker exec app /bin/bash -c 'npm run pre-commit'
```

Any changes to the local source code will require the app's container to be rebuilt using:
```
docker-compose up --build app
```
