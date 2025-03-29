source .env
docker exec -it pgsql_prod psql -U $POSTGRES_USER -d $POSTGRES_DB