source .env
docker exec -it pgsql_dev psql -U $POSTGRES_USER -d $POSTGRES_DB