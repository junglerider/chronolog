# chronolog

Time sheet application with TypeScript/Node.js backend and Vue/JavaScript frontend.

![screenshot](screenshot.png "Chronolog Application")

Disclaimer: This application is currently in alpha stage and not ready for production.

## Install

You need the npm package manager for installation. You also need sqlite3 for building the database. The API and web application are installed separately:

```
cd api
npm install

cd ../app
npm install
```

## Build and deploy

The application runs in a single Docker container. It uses an SQLite database to persist information. To create a production build, run:

```
./build docker
```

This creates a new docker image called chronolog.latest which exposes internal port 8888 (or as configured in ./api/config.json). While there is an SQLite sample database included in the container image, this should only be used for demos and testing, as it will be destroyed along with the container. For deployment, place a chronolog.db database file into a directory of your choice and use a host mount, e.g.:

```
docker run -d --name chronolog -p 5000:8888 -v /your/db/directory:/home/db chronolog
```

This makes the application available at localhost:5000 and it will look for the chronolog.db file in /your/db/directory.

## Run

```
http://localhost:5000
```
The Chronolog web application at this URL should display a login dialogue. Sample data includes four configured users with the following user names: `enzo`, `james`, `gabriella` and `mehmed`. The passwords are left empty.