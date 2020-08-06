import { Request, Response, NextFunction } from 'express'
import { SqlGenerator } from './SqlGenerator'
import { Database } from './Database'
import * as Logger from 'bunyan'

/**
 * SingleTable provides CRUD methods for a single table/view.
 */
export class SingleTable {

  private table: string
  protected db: Database
  protected logger: Logger
  protected sqlGenerator: SqlGenerator
  protected schema: object

  constructor (table: string, schema: object, db: Database, logger: Logger) {
    this.table = table
    this.db = db
    this.logger = logger
    this.schema = schema
    this.sqlGenerator = new SqlGenerator (logger, schema)
  }

  public validateCreate (req: Request) {
    // override
  }

  private getTableName() {
    return this.table.split(' ')[0]
  }

  private getFieldList(fields) {
    return fields.map (field => field.substr (field.indexOf ('.') + 1)).join ( ', ')
  }

  private getUpdateList(fields) {
    return fields.map (field => field.substr (field.indexOf ('.') + 1) + ' = ?').join (', ')
  }

  public async list (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`${this.table}.list()`)
    try {
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = `SELECT * FROM ${this.table} ` + whereClause
      const rows = await this.db.all (sql, params)
      res.header ( {'Access-Control-Allow-Origin': '*'} )
      rows ? res.status (200).json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  public async count (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`${this.table}.count()`)
    try {
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = `SELECT COUNT(*) AS count FROM ${this.table} ` + whereClause
      const row = await this.db.get (sql, params)
      res.header ( {'Access-Control-Allow-Origin': '*'} )
      row ? res.status (200).json (row) : res.status (404)
      next ()
    } catch (err) {
      next (err)
    }
  }

  public async create (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`${this.table}.create()`)
    try {
      this.validateCreate (req)
      let [ names, values ] = this.sqlGenerator.buildParameterList (req.body)
      if (names.length === 0) {
        throw new Error (`400:${this.table}.create() was called with no data to insert`)
      }
      let sql = `INSERT INTO ${this.getTableName()} (${this.getFieldList(names)}) VALUES (${ names.map (n => '?').join (', ') })`
      let result: any = await this.db.run (sql, values)
      const id = result.lastID
      if (!id) {
        throw new Error(`Could not obtain new ${this.table} id`)
      }
      res.status (201).json ({id: id})
      next ()
    }
    catch (err) {
      next (err)
    }
  }

  public async read (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`${this.table}.read(${[req.params.id]}))`)
    const sql = `SELECT * FROM ${this.table} WHERE id = ?`
    try {
      let row = await this.db.get (sql, [req.params.id])
      res.header ( {'Access-Control-Allow-Origin': '*'} )
      row ? res.status (200).json (row) : res.status (404).json ()
      next ()
    }
    catch (err) {
      next (err)
    }
  }

  public async update (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`${this.table}.update(${[req.params.id]})`)
    let status = 400
    try {
      let [ names, values ] = this.sqlGenerator.buildParameterList (req.body)
      if (names.length > 0) {
        const sql = `UPDATE ${this.getTableName()} SET ` + this.getUpdateList(names) + ' WHERE id = ' + req.params.id
        const result: any = await this.db.run (sql, values)
        status = result.changes ? 204 : 404
      }
      res.status (status).json()
      next ()
    }
    catch (err) {
      next (err)
    }
  }

  public async delete (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`${this.table}.delete(${[req.params.id]})`)
    try {
      const result: any = await this.db.run (`DELETE FROM ${this.getTableName()} WHERE id = ?`, [req.params.id])
      result && result.changes > 0 ? res.status (204).json () : res.status (404).json ()
      next ()
    }
    catch (err) {
      next (err)
    }
  }
}