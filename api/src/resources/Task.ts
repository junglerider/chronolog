import { Request, Response, NextFunction } from 'express';
import { SingleTable } from '../SingleTable'
import { Database } from '../Database';
import * as Logger from 'bunyan'

export class Task extends SingleTable {

  constructor (db: Database, logger: Logger) {
    const schema = {
      id: 't.id',
      customer_id: 't,customer_id',
      user_id: 't.user_id',
      parent_id: 't.parent_id',
      name: 't.name',
      description: 't.description',
      is_active: 't.is_active',
      is_closed: 't.is_closed',
      is_leaf: 't.is_leaf',
      created_at: 't.created_at',
      updated_at: 't.updated_at'
    }
    super ('task AS t', schema, db, logger)
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

  public async todoList (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('task.todoList()')
    try {
      const orderClause = this.sqlGenerator.generateOrderClause (req.query)
      const sql = `SELECT t.id, t.name, t.description, t.created_at, t.is_active,  c.name AS customer_name, SUM(l.duration) AS duration FROM task t JOIN customer c ON (c.id = t.customer_id) JOIN time_log l ON (l.task_id = t.id) WHERE t.user_id = ? AND t.is_leaf = 1 AND t.is_closed = 0 GROUP BY t.id ${orderClause}`
      const rows = await this.db.all (sql, [req.params.userId])
      rows ? res.json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  public async todoCount (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('task.todoCount()')
    try {
      const sql = `SELECT COUNT(*) AS count FROM task t WHERE t.user_id = ? AND t.is_leaf = 1 AND t.is_closed = 0;`
      const row = await this.db.get (sql, [req.params.userId])
      row ? res.status (200).json (row) : res.status (404)
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
