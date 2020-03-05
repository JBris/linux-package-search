# linux-package-search

## Table of Contents  

* [Introduction](#introduction)<a name="introduction"/>
* [Server](#server)<a name="server"/>
* [CLI](#cli)<a name="cli"/>
* [Postgres](#postgres)<a name="postgres"/>
* [Knex](#knex)<a name="knex"/>
* [Redis](#redis)<a name="redis"/>

### Introduction

Linux Package Search is a simple search tool to retrieve information for Linux packages. Supported distributions are:
* Ubuntu
* Debian
* Fedora

Run `./build.sh` to get started.

### Server

The application is bundled with an Express server to make proxy search requests. See [package.json](server/package.json) for a full list of dependencies.

Access localhost/v1/api-docs to access Swagger documentation for the available API endpoints. Access localhost/api/v1/api-docs to view the swagger configuration in JSON format.

Endpoints are protected using an API secret. This value is set using the NODE_API_SECRET environment variable. Include the secret in the `Authorization` header of your HTTP requests.

### CLI

A command line version of the application is also included. Run `npm install .` to install the `linsearch` command globally. Execute `linsearch --help` to view all available commands.

```
search|s       Search for a list of packages by name.
view|v         View details for the specified package.
arsearch|as    Search for a list of archived packages by name.
arview|av      View archived details for the specified package.
arsave|asv     Save the specified package to the archive.
ardel|ad       Delete the specified package from the archive.
```

Ensure that a `.env` file is included in the current directory when executing `linsearch`. 

### Postgres

Package information is archived into a Postgres database. 

Execute `make dbdump` to view the contents of the database as raw SQL (the output should ideally be redirected to a file). Execute `make dbexp` to export the database into an SQL file inside the `data` directory. Execute `make dbimp` to import the SQL file into the database.

By default, content will be stored inside of the `linux_packages` database. This consists of a `distribution` table, which stores a list of supported Linux distros, and a `packages` table, which contains archived package information. The `packages` table contains the `name` (string, 255), `displayName` (string, 255), `version` (string, 255), `search_query` (string, 255), and `additionalProperties` (JSON binary) columns.

Access Adminer from localhost:$ADMINER_PORT. This defaults to port 8080.

### Knex

This app uses the Knexjs module to handle seeds, migrations, and SQL queries. Knex-related scripts can be accessed from the [server](server) directory.

The `seed` script will fill the `distribution` table with supported distributions.

The `migration` table will define the structure of the `distribution` and `packages` tables.

The `knexfile.js` file exclusively uses environment variables. Ensure that you export the contents of the `.env` file into your current shell environment.

### Redis

This application leverages Redis to cache your JSON-formatted search results. Set the cache lifetime using the `NODE_CACHE_LIFETIME` environment variable.

Cache keys use the pattern {command}-{distribution}-{package}.

A fallback in-memory cache is also included should Redis be unavailable. Set `NODE_CACHE_BACKEND` to `memory` to enable this cache.