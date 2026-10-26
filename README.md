# Chronolog time sheets

Time sheet web application with an embedded database. Runs in a single docker container.

![screenshot](screenshot.png "Chronolog Application")

## Features

- Time sheet input
- Daily, weekly and monthly time sheet views
- Working time recording
- Todo lists
- Invoicing
- Printable reports
- Address management (organisations and contacts)
- Multi-user and multi-customer

## Install and run application

Pull the docker image from GitHub, create a running container and test the app in the browser. There is an in-container sqlite3 database file with demo data. Log in as the admin user "enzo" without password.

```
$ docker pull ghcr.io/junglerider/chronolog/chronolog:2.0.0
$ docker run -d --name chronolog-test -p 5404:5404 chronolog:latest
$ xdg-open http://localhost:5404

```
## Run in production

Copy the db/empty.db file to /your/db/directory and mount it into a new container. The empty db only contains a single account. Log in as "admin" without password. Set a password.
```
$ docker pull ghcr.io/junglerider/chronolog/chronolog:2.0.0
$ docker run -d --name chronolog -p 5404:5404 -v /your/db/directory:/home/db chronolog:latest
$ xdg-open http://localhost:5404

```

## Development

The application is based on a TypeScript/Node.js backend and a Vue/JavaScript frontend. Use Node.js 24 LTS and npm for installation. You also need sqlite3 for building a demo database. The repository contains a build command. You can install and run the Chronolog application locally in two steps:

```
./build install
./build all
xdg-open http://localhost:5403
```

Note that Vite is configured to run on port 5403. The backend is configured with `api/src/config.json`.

To regenerate the populated demo database in the repository, run `./build db --force` only when you intend to discard the existing `db/chronolog.db` and recreate it from the schema and fixtures. Without `--force`, `./build db` creates the database only when that path does not already exist.

## Build and run docker image locally

```
./build docker
http://localhost:5404
```

The Chronolog web application at this URL should display a login dialogue. The generated `db/chronolog.db` database contains four sample users (`enzo`, `james`, `gabriella`, and `mehmed`), all with empty passwords. Do not use this in production.