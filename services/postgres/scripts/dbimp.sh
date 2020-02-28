#!/usr/bin/env bash 

psql -U $POSTGRES_USER $POSTGRES_DB < "/var/data/${POSTGRES_DB}.sql"