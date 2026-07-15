FROM postgres:18.4-alpine

COPY postgres-init/ /docker-entrypoint-initdb.d/