#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "starting service provider container"
docker build . -f vsp.Dockerfile -t vsp
docker run -d -p50400:50400 --name vsp vsp

echo "start the database container"
docker build . -f db.Dockerfile -t test-db
docker run -d -p5432:5432 --name stub-rp-test-db stub-rp-test-db

echo "running tests"
npm run pre-commit

echo "shutdown database and vsp containers container"
docker stop vsp
docker rm vsp
docker stop stub-rp-test-db
docker rm stub-rp-test-db