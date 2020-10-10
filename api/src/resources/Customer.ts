import { Request, Response, NextFunction } from 'express'
import { SingleTable } from '../SingleTable'
import { Database } from '../Database'
import { IRequest } from '../UserSession'
import * as Logger from 'bunyan'

export class Customer extends SingleTable {

  constructor (db: Database, logger: Logger) {
    const schema = {
      id: 'c.id',
      organisation_id: 'c.organisation_id',
      name: 'c.name',
      is_retired: 'c.is_retired',
      notes: 'c.notes',
      created_at: 'c.created_at',
      updated_at: 'c.updated_at',
    }
    super ('customer AS c', schema, db, logger)
  }

  public async list (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('customer.list()')
    try {
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = `SELECT c.*, o.name AS organisation_name FROM customer c LEFT JOIN organisation o ON (o.id = c.organisation_id) ${whereClause}`
      const rows = await this.db.all (sql, params)
      rows ? res.json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  public async taskCount (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('customer.taskCount()')
    try {
      const [whereClause, params] = this.sqlGenerator.generateWhereClause (req.query)
      const sql = `SELECT c.id, count(t.id) AS task_count FROM customer c LEFT JOIN task t ON (t.customer_id = c.id) ${whereClause} GROUP BY c.id`
      const rows = await this.db.all (sql, params)
      rows ? res.json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  public async read (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('customer.list()')
    try {
      this.logger.trace (`customer.read(${req.params.id}))`)
      const sql = `SELECT c.*, o.name AS organisation_name FROM customer c LEFT JOIN organisation o ON (o.id = c.organisation_id) WHERE c.id = ?`
      let row = await this.db.get (sql, [req.params.id])
      row ? res.status (200).json (row) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  public validateCreate (req: Request) {
    if (!req.body.name) {
      throw new Error ('400:Create new customer: name is required')
    }
    if (!req.body.organisation_id) {
      throw new Error ('400:Create new customer: organisation_id is required')
    }
  }

  public validateAccess (req: IRequest) {
    if (this.isWriteAccess (req) && !req.session.hasInvoicing ()) {
      throw new Error ('403:No invoicing credentials')
    }
  }
}
