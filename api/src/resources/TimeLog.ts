import { Request, Response, NextFunction } from 'express';
import { Database } from '../Database'
import { SingleTable } from '../SingleTable'
import * as Logger from 'bunyan'

export class TimeLog extends SingleTable {

  constructor (db: Database, logger: Logger) {
    const schema = {
      id: 'id',
      task_id: 'task_id',
      user_id: 'user_id',
      description: 'description',
      duration: 'duration',
      date: 'date',
      updated_at: 'updated_at'
    }
    super ('time_log', schema, db, logger)
  }

  public async list (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('time_log.list()')
    try {
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = `SELECT tl.*, t.name AS task_name, c.name AS customer_name FROM time_log tl JOIN task t ON (tl.task_id = t.id) JOIN customer c ON (t.customer_id = c.id) ${whereClause}`
      const rows = await this.db.all (sql, params)
      rows ? res.json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  public async daily (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('time_log.daily()')
    try {
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = `SELECT date, SUM(duration) AS duration FROM time_log ${whereClause} GROUP BY date`
      const rows = await this.db.all (sql, params)
      rows ? res.json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  public validateCreate(req: Request) {
    if (!req.body.date) {
      throw new Error ('400:Create new time log: date is required')
    }
    if (!req.body.task_id) {
      throw new Error ('400:Create new time log: task_id is required')
    }
    if (!req.body.user_id) {
      throw new Error ('400:Create new time log: user_id is required')
    }
  }
}
