#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

#TODO start verify-service-provider, setting an entity-id to "http://verify-service-provider-dev-service"

echo "start the database container"
docker build . -f db.Dockerfile -t stub-rp-test-db
docker run -d -p5432:5432 --name stub-rp-test-db stub-rp-test-db

npm run pre-commit

echo "shutdown database container"
docker rm $(docker stop $(docker ps -a -q --filter="name=stub-rp-test-db"))

#TODO stop verify-service-provider