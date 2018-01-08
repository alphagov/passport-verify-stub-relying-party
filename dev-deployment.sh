#!/usr/bin/env bash
set -e
export CURRENT_DIR=$PWD
function cleanup {
  cd "$CURRENT_DIR"
  if [ -d "work" ] ; then
      rm -r work
  fi 
}
trap cleanup EXIT
cd "$(dirname "$0")"

APP_NAME="passport-verify-stub-relying-party-dev"

cfLogin() {
  if [ -z "${CF_USER:-}" ]; then
    echo "Using cached credentials in ${CF_HOME:-home directory}" >&2
  else
    CF_API="${CF_API:?CF_USER is set - CF_API environment variable also needs to be set}"
    CF_ORG="${CF_ORG:?CF_USER is set - CF_ORG environment variable also needs to be set}"
    CF_SPACE="${CF_SPACE:?CF_USER is set - CF_SPACE environment variable also needs to be set}"
    CF_PASS="${CF_PASS:?CF_USER is set - CF_PASS environment variable also needs to be set}"

    # CloudFoundry will cache credentials in ~/.cf/config.json by default.
    # Create a dedicated work area to avoid contaminating the user's credential cache
    export CF_HOME="$CURRENT_DIR/work"
    rm -rf "$CF_HOME"
    mkdir -p "$CF_HOME"
    echo "Authenticating to CloudFoundry at '$CF_API' ($CF_ORG/$CF_SPACE) as '$CF_USER'" >&2
    cf api "$CF_API"
    # Like 'cf login' but for noninteractive use
    cf auth "$CF_USER" "$CF_PASS"
    cf target -o "$CF_ORG" -s "$CF_SPACE"
  fi
}

cfSetDatabaseConnectionString() {
    cf unset-env $APP_NAME DATABASE_CONNECTION_STRING
    DATABASE_URL="$(cf env $APP_NAME | grep -o '"postgres://[^"]*' | tr -d '"')"
    cf set-env $APP_NAME DATABASE_CONNECTION_STRING "$DATABASE_URL?ssl=true"
}

cfBindWithDatabase() {
    cf bind-service $APP_NAME verify-local-matching-service-example-db
    cf restart $APP_NAME
}

./docker-build.sh

cfLogin
cfBindWithDatabase
cfSetDatabaseConnectionString

cf push -f dev-manifest.yml

