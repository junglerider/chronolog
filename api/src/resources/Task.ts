import { Request, Response, NextFunction } from 'express';
import { SingleTable } from '../SingleTable'
import { Database } from '../Database';
import * as Logger from 'bunyan'

export class Task extends SingleTable {

  constructor (db: Database, logger: Logger) {
    const schema = {
      id: 'id',
      customer_id: 'customer_id',
      user_id: 'user_id',
      parent_id: 'parent_id',
      name: 'name',
      description: 'description',
      is_active: 'is_active',
      is_closed: 'is_closed',
      is_leaf: 'is_leaf',
      created_at: 'created_at',
      updated_at: 'updated_at'
    }
    super ('task', schema, db, logger)
  }

  public async list (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('task.list()')
    try {
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = `SELECT t.id, t.parent_id, t.name, c.name AS customer_name FROM task t JOIN customer c ON (c.id = t.customer_id) ${whereClause}`
      const rows = await this.db.all (sql, params)
      rows ? res.json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  public validateCreate(req: Request) {
    if (!req.body.name) {
      throw new Error ('400:Create new task: name is required')
    }
  }
}
