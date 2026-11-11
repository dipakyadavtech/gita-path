#!/usr/bin/env bash
# Recreates the test database on a local PostgreSQL and runs all API tests.
set -euo pipefail
PGHOST=${PGHOST:-localhost} PGUSER=${PGUSER:-postgres}
psql -h "$PGHOST" -U "$PGUSER" -qc "drop database if exists gitapath_test" -c "create database gitapath_test"
cd "$(dirname "$0")/.." && ./gradlew test "$@"
