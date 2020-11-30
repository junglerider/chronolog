import * as sqlite3 from 'sqlite3'
import { NextFunction } from 'connect'

const OPEN_MSG = 'Sqlite connection opened.'
const OPEN_ERR = 'Sqlite open error!'
const CLOSE_MSG = 'Sqlite connection closed.'

/**
 * Database provides a promisified interface to the SQLite3 DB. Connections are opened automatically
 * upon use and closed after a period of inactivity (@see db_connection_timeout).
 * Foreign keys are enabled by default.
 */
export class Database {

  private db: sqlite3.Database = null
  private timeout = null
  private config = null
  private logger = null

  /**
   * The Database module is configured through the config JSON.
   *
   * @param config configuration object containig database file name and connection timeout value.
   * @param logger Bunyan logger
   */
  constructor (config, logger) {
    this.config = config
    this.logger = logger
  }

  /**
   * Restarts the timer for automatic connection closing.
   */
  private resetTimeout () {
    if (this.timeout) {
      clearTimeout (this.timeout)
    }
    this.timeout = setTimeout (() => {
      this.closeConnection ()
    }, this.config.db_connection_timeout)
  }

  /**
   * Formats a query with parameters
   *
   * @param query query sting with ? placeholders
   * @param params query parameter array
   */
  private formatQuery(query: string, params: any[]) {
    let result = query
    if (params) {
      for (let param of params) {
        result = result.replace('?', String(param))
      }
    }
    return result
  }

  /**
   * Opens the Sqlite3 database connection explicitly.
   */
  public open () {
    return new Promise ((resolve, reject) => {
      this.implicitOpen ((err) => {
        err ? reject (err) : resolve (true)
      })
    })
  }

  /**
   * Opens the Sqlite3 database connection, sets default options (foreign keys on) and logs a message.
   *
   * @param callback
   */
  private implicitOpen (callback: NextFunction) {
    this.resetTimeout ()
    if (this.db) {
      callback ()
    } else {
      const sqlite = sqlite3.verbose ()
      const dbname = this.config.sqlite_db
      this.db = new sqlite3.Database (dbname, sqlite.OPEN_READWRITE, (err) => {
        if (err) {
          this.logger.error (OPEN_ERR)
          callback (err)
        } else {
          this.db.run ('PRAGMA foreign_keys = true', (err) => {
            err ? this.logger.error (OPEN_ERR + ' ' + err.message) : this.logger.info (OPEN_MSG)
            callback (err)
          })
        }
      })
    }
  }

  /**
   * Closes the Sqlite3 database connection explicitly.
   */
  public close () {
    return new Promise ((resolve, reject) => {
      this.closeConnection ()
      resolve (true)
    })
  }

  /**
   * Closes the Sqlite3 database connection and logs a message.
   */
  private closeConnection () {
    if (this.db) {
      this.db.close ()
      this.db = null
      this.logger.info (CLOSE_MSG)
    }
  }

  /**
   * Runs an arbitrary SQL query or a database command (e.g a PRAGMA command).
   *
   * @param query SQL string or command to execute
   * @param params optional array of input parameters (for example for INSERT or UPDATE)
   */
  public run (query: string, params = undefined) {
    return new Promise ((resolve, reject) => {
      this.implicitOpen ((err) => {
        if (! err) {
          this.logger.debug ('SQL: ' + this.formatQuery(query, params))
          this.db.run (query, params, function (err) {
            err ? reject (err): resolve ({ lastID: this.lastID, changes: this.changes })
          })
        } else {
          reject (err)
        }
      })
    })
  }

  /**
   * Retrieves a single data row from the database.
   *
   * @param query SQL SELECT string
   * @param params optional array of input parameters (e.g. for WHERE clause)
   */
  public get (query: string, params = undefined) {
    return new Promise ((resolve, reject) => {
      this.implicitOpen ((err) => {
          if (! err) {
            this.logger.debug ('SQL: ' + this.formatQuery(query, params))
            this.db.get (query, params, (err, row) => {
            err ? reject (err) : resolve (row)
          })
        } else {
          reject (err)
        }
      })
    })
  }

  /**
   * Retrieves multiple data rows from the database.
   *
   * @param query SQL SELECT string
   * @param params optional array of input parameters (e.g. for WHERE clause)
   */
  public all (query: string, params = undefined) {
    return new Promise ((resolve, reject) => {
      this.implicitOpen ((err) => {
        if (! err) {
          this.logger.debug ('SQL: ' + this.formatQuery(query, params))
          this.db.all (query, params, (err, rows)  => {
            err ? reject (err) : resolve (rows)
          })
        } else {
          reject (err)
        }
      })
    })
  }

  /**
   * Retrieves multiple data rows from the database and processes each row in a callback function.
   *
   * @param query SQL SELECT string
   * @param params optional array of input parameters (e.g. for WHERE clause)
   * @param callback function that processes a single data row
   */
  public each (query: string, params, callback: Function) {
    return new Promise ((resolve, reject) => {
      this.implicitOpen ((err) => {
        if (! err) {
          this.db.serialize (() => {
            this.logger.debug ('SQL: ' + this.formatQuery(query, params))
            this.db.each (query, params, (err, row)  => {
              err ? reject (err) : callback (row)
            })
            resolve (true)
          })
        } else {
          reject (err)
        }
      })
    })
  }

}
