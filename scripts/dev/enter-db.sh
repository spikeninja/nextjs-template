source .env
docker exec -it PROJECT_NAME_pgsql_dev psql -U $PG_DB_USER -d $PG_DB_NAME