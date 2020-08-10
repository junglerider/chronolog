import { Request, Response, NextFunction } from 'express';
import { SqlGenerator } from '../SqlGenerator'
import { Database } from '../Database';
import * as Logger from 'bunyan'

export class TimeLogReport {

  private db: Database
  private logger: Logger
  private sqlGenerator: SqlGenerator

  private schema = {
    id: 'tl.id',
    task_id: 'tl.task_id',
    task_name: 't.name',
    user_id: 'tl.user_id',
    user_name: 'p.name',
    description: 'tl.description',
    duration: 'tl.duration',
    date: 'tl.date',
    updated_at: 'tl.updated_at',
    customer_id: 't.customer_id',
    customer_name: 'c.name',
  }

  constructor (db: Database, logger: Logger) {
    this.db = db
    this.logger = logger;
    this.sqlGenerator = new SqlGenerator (logger, this.schema)
  }

  public async list (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('TImeLogReport.list()')
    try {
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = `SELECT tl.*, t.name AS task_name, c.id AS customer_id, c.name AS customer_name, p.first_name || ' ' || p.last_name AS user_name FROM time_log tl LEFT JOIN task t ON (tl.task_id = t.id) LEFT JOIN customer c ON (t.customer_id = c.id) LEFT JOIN user u ON (t.user_id = u.id) LEFT JOIN person p ON (p.id = u.person_id) ${whereClause}`
      const rows = await this.db.all (sql, params)
      rows ? res.status (200).json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }
}
