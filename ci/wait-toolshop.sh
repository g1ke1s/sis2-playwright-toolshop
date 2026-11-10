#!/usr/bin/env bash
# Waits for the local Toolshop started from ci/toolshop.compose.yml, seeds the database
# and checks that the API and the UI answer.
set -euo pipefail
dc() { docker compose -f "$(dirname "$0")/toolshop.compose.yml" "$@"; }

wait_for() {  # wait_for <name> <tries> <delay> <command...>
  local name=$1 tries=$2 delay=$3; shift 3
  for i in $(seq 1 "$tries"); do
    if "$@" >/dev/null 2>&1; then echo "$name is ready"; return 0; fi
    sleep "$delay"
  done
  echo "::error::$name did not start"; dc ps; dc logs --tail=50; return 1
}

wait_for MariaDB 60 2 dc exec -T mariadb mysqladmin ping -h localhost -uroot -proot --silent
dc exec -T laravel-api php artisan migrate:fresh --seed --force
wait_for API 60 2 curl -fsS http://localhost:8091/status
wait_for UI 90 5 curl -fsS http://localhost:4200
