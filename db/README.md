# Chronolog Database

Requires sqlite3. To create a new empty database, run the following command from the terminal:
```
sqlite3 /path/to/new.db < schema.sql
```

To add demo data to it, run:
```
sqlite3 /path/to/new.db < fixtures.sql
```

From the repository root, `./build db --force` recreates the populated demo database and replaces `db/chronolog.db`; use it only when intentionally discarding that file. Without `--force`, `./build db` creates the database only when it does not already exist.
