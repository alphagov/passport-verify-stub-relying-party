FROM postgres:12.5

ENV POSTGRES_DB=stub_rp_test
COPY ./database-schema.sql /docker-entrypoint-initdb.d/database-schema.sql
