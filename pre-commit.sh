#!/usr/bin/env bash
set -e
CURRENT_DIR=$PWD
function cleanup {
  cd "$CURRENT_DIR"
}
trap cleanup EXIT
cd "$(dirname "$0")"

if [ ! ${VERIFY_SERVICE_PROVIDER_HOST} ]
then
  echo "warning: VERIFY_SERVICE_PROVIDER_HOST not set, using localhost:50400 by default"
  echo "warning: remember to run stub-verify-hub as well"
fi

if [ ! ${COMPLIANCE_TOOL_HOST} ]
  then echo "warning: COMPLIANCE_TOOL_HOST not set, using localhost:50270 by default"
fi

npm test
npm run acceptance-tests
