#!/usr/bin/env bash
set -euxo pipefail

#check if environment variable is set
: "${VERIFY_SERVICE_PROVIDER_HOST:?}"

cd "$(dirname "$0")"
image_id="$(docker build -q . | cut -d ':' -f 2)"
container_id="$(docker run -d "$image_id")"

function cleanup {
  cd "$CURRENT_DIR"
  docker kill "$container_id"
  docker rm "$container_id"
  docker image rm "$image_id" || :
}
trap cleanup EXIT

docker exec -e "VERIFY_SERVICE_PROVIDER_HOST=${VERIFY_SERVICE_PROVIDER_HOST:?}" "$container_id" /bin/bash -c "npm run build"

docker cp "$container_id:/usr/src/app/build" build
