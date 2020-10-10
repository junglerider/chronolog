import { Request, Response, NextFunction } from 'express'
import { SqlGenerator } from './SqlGenerator'
import { Database } from './Database'
import { IRequest } from './UserSession'
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
  protected idColumn: string

  constructor (table: string, schema: object, db: Database, logger: Logger, id = 'id') {
    this.table = table
    this.db = db
    this.logger = logger
    this.schema = schema
    this.sqlGenerator = new SqlGenerator (logger, schema)
    this.idColumn = id
  }

  public validateCreate (req: Request) {
    // override
  }

  public validateAccess (req: IRequest) {
    // override
  }

  protected isWriteAccess(req: Request) {
    return ['PUT', 'POST', 'PATCH', 'DELETE'].includes(req.method)
  }

  private getTableName() {
    return this.table.split(' ')[0]
  }

  private getFieldList(fields) {
    return fields.map (field => field.substr (field.indexOf ('.') + 1)).join ( ', ')
  }

  public getUpdateList(fields) {
    return fields.map (field => field.substr (field.indexOf ('.') + 1) + ' = ?').join (', ')
  }

  /**
   * List filtered entities
   *
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  public async list (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`${this.getTableName()}.list()`)
    try {
      this.validateAccess (<IRequest>req)
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = `SELECT * FROM ${this.table} ` + whereClause
      const rows = await this.db.all (sql, params)
      rows ? res.status (200).json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  /**
   * Count filtered entities
   *
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  public async count (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`${this.getTableName()}.count()`)
    try {
      this.validateAccess (<IRequest>req)
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = `SELECT COUNT(*) AS count FROM ${this.table} ` + whereClause
      const row = await this.db.get (sql, params)
      row ? res.status (200).json (row) : res.status (404)
      next ()
    } catch (err) {
      next (err)
    }
  }

  /**
   * Create a new entity
   *
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  public async create (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`${this.getTableName()}.create()`)
    try {
      this.validateAccess (<IRequest>req)
      this.validateCreate (req)
      let [ names, values ] = this.sqlGenerator.buildParameterList (req.body)
      if (names.length === 0) {
        throw new Error (`400:${this.table}.create() was called with no data to insert`)
      }
      let sql = `INSERT INTO ${this.getTableName()} (${this.getFieldList(names)}) VALUES (${ names.map (n => '?').join (', ') })`
      let result: any = await this.db.run (sql, values)
      const id = result.lastID
      if (!id) {
        throw new Error(`Could not obtain new ${this.table} ${this.idColumn}`)
      }
      res.status (201).json ({[this.idColumn]: id})
      next ()
    }
    catch (err) {
      next (err)
    }
  }

  /**
   * Read an entity
   *
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  public async read (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`${this.getTableName()}.read(${[req.params[this.idColumn]]}))`)
    try {
      this.validateAccess (<IRequest>req)
      const sql = `SELECT * FROM ${this.table} WHERE ${this.idColumn} = ?`
      let row = await this.db.get (sql, [req.params[this.idColumn]])
      row ? res.status (200).json (row) : res.status (404).json ()
      next ()
    }
    catch (err) {
      next (err)
    }
  }

  /**
   * Update an existing entity
   *
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  public async update (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`${this.getTableName()}.update(${[req.params[this.idColumn]]})`)
    try {
      this.validateAccess (<IRequest>req)
      let status = 400
      let [ names, values ] = this.sqlGenerator.buildParameterList (req.body)
      if (names.length > 0) {
        values.push(req.params[this.idColumn])
        const sql = `UPDATE ${this.getTableName()} SET ` + this.getUpdateList(names) + ` WHERE ${this.idColumn} = ?`
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

  /**
   * Delete an entity
   *
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  public async delete (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`${this.getTableName()}.delete(${[req.params[this.idColumn]]})`)
    try {
      this.validateAccess (<IRequest>req)
      const result: any = await this.db.run (`DELETE FROM ${this.getTableName()} WHERE ${this.idColumn} = ?`, [req.params[this.idColumn]])
      result && result.changes > 0 ? res.status (204).json () : res.status (404).json ()
      next ()
    }
    catch (err) {
      next (err)
    }
  }
}