source .env
docker exec -it PROJECT_NAME_pgsql_dev psql -U $POSTGRES_USER -d $POSTGRES_DB