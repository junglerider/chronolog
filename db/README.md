# Chronolog Database

Requires sqlite3 to create a new DB from schema.sql. To create a new empty database, run:

```
sqlite3 chronolog.db < schema.sql
```

To create a new database with sample data, run:
```
sqlite3 chronolog.db < schema.sql
sqlite3 chronolog.db < fixtures.sql
```
