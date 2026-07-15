#!/usr/bin/env bash
set -e
set -u

# Creates additional databases (beyond POSTGRES_DB) on first container init.
# Set POSTGRES_MULTIPLE_DATABASES as a comma-separated list, e.g. "app,umami".
function create_database() {
	local database=$1
	echo "Creating database '$database' owned by '$POSTGRES_USER'"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    SELECT 'CREATE DATABASE "$database" OWNER "$POSTGRES_USER"'
	    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$database')\gexec
EOSQL
}

if [ -n "${POSTGRES_MULTIPLE_DATABASES:-}" ]; then
	echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
	IFS=',' read -ra DBS <<< "$POSTGRES_MULTIPLE_DATABASES"
	for db in "${DBS[@]}"; do
		create_database "$(echo "$db" | xargs)"
	done
	echo "Multiple databases created"
fi
