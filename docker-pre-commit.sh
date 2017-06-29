#!/usr/bin/env bash
set -e
set -x
cd "$(dirname "$0")"
image_id="$(docker build -q . | cut -d ':' -f 2)"
container_id="$(docker run -d "$image_id")"

function cleanup {
  cd "$CURRENT_DIR"
  docker kill "$container_id"
  docker rm "$container_id"
  docker image rm "$image_id" || exit
}
trap cleanup EXIT

docker exec "$container_id" "/usr/src/app/pre-commit.sh"
docker cp "$container_id:/usr/src/app/build" build
docker cp "$container_id:usr/src/app/passport-verify/build" passport-verify/build
