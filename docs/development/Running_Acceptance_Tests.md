## Passport Verify Stub Relying Party - Acceptance Tests

Running the end to end acceptance tests requires:
* the node app
* a database
* a verify service provider (VSP)
* a matching service adapater (MSA)
* the compliance tool

In order to run the tests in a consistent way (locally, on travis and on jenkins), we have
used docker to spin up local docker containers for the node app, database and VSP.

The [VSP container](/vsp.Dockerfile) is based on the v1.0.0 release of the VSP and is configured to:
* retrieve the necessary metadata from a MSA running on PAAS
* send and receive SAML messages to the Compliance Tool running on the reference environment

The [Database container](/db.Dockerfile) is a default postgres image, configured with a schema
that matches the [Local Matching Service Example](http://github.com/alphagov/verify-local-matching-service-example)

**WARNING**: care must be taken to ensure this hard coded schema is kept up to date with the Local Matching Service Example's

## Dependencies:

The configuration for these tests currently relies on:
* the Compliance Tool hosted in the reference environment
* the Matching Service Adapter hosted on PAAS

## Running the tests locally

the `pre-commit.sh` script starts the vsp and db containers and exposes them on ports 50400 and 5432 respectively
so that the acceptance can be run from source.

## Travis and Jenkins

docker-compose is used to start the required components in the Travis and Jenkins Workspaces to avoid any
conflicts with port numbers.  These steps can be run locally:

to start these containers:
```
docker-compose up [-d]
```

to run the tests (or any npm scripts):
```
docker exec app /bin/bash -c 'npm run pre-commit'
```

Any changes to the local source code will require the app's container to be rebuilt
```
docker-compose up --build app
```

