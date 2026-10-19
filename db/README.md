# Chronolog Database

Requires sqlite3 to create a new database at a path that does not already exist. To create an empty database, run:

```
sqlite3 /path/to/new.db < schema.sql
```

To create a new database with sample data directly, run:
```
sqlite3 /path/to/new.db < schema.sql
sqlite3 /path/to/new.db < fixtures.sql
```

From the repository root, `./build db --force` recreates the populated demo database and replaces `db/chronolog.db`; use it only when intentionally discarding that file. Without `--force`, `./build db` creates the database only when it does not already exist. The Docker image uses the tracked `empty.db` and does not include the generated `chronolog.db`.
