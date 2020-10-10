import { Request, Response, NextFunction } from 'express'
import { SingleTable } from '../SingleTable'
import { Database } from '../Database'
import { IRequest } from '../UserSession'
import * as Logger from 'bunyan'

export class TimeClock extends SingleTable {

  constructor (db: Database, logger: Logger) {
    const schema = {
      date: 'tc.date',
      user_id: 'tc.user_id',
      work_duration: 'tc.work_duration',
      arrival_time: 'tc.arrival_time',
      departure_time: 'tc.departure_time',
      json_log: 'tc.json_log',
      updated_at: 'tc.updated_at'
    }
    super ('time_clock AS tc', schema, db, logger)
  }

  public async list (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`timeclock.list()`)
    try {
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = `SELECT tc.date, tc.user_id, tc.work_duration, tc.arrival_time, tc.departure_time FROM time_clock AS tc ` + whereClause
      const rows = await this.db.all (sql, params)
      rows ? res.status (200).json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  public async read (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`timeclock.read(${[req.params.user_id,req.params.date]})`)
    try {
      const sql = `SELECT * FROM time_clock WHERE user_id = ? AND date = ?`
      let row = await this.db.get (sql, [req.params.user_id, req.params.date])
      row ? res.status (200).json (row) : res.status (404).json ()
      next ()
    }
    catch (err) {
      next (err)
    }
  }

  public async update (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`timeclock.update(${[req.params.user_id,req.params.date]})`)
    try {
      this.validateAccess (<IRequest>req)
      let status = 400
      let [ names, values ] = this.sqlGenerator.buildParameterList (req.body)
      if (names.length > 0) {
        const sql = `UPDATE time_clock AS tc SET ` + this.getUpdateList(names) + ' WHERE tc.user_id = ? AND tc.date = ?'
        values.push(req.params.user_id)
        values.push(req.params.date)
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
    this.logger.trace (`timeclock.update(${[req.params.user_id,req.params.date]})`)
    try {
      this.validateAccess (<IRequest>req)
      const result: any = await this.db.run (`DELETE FROM time_clock WHERE user_id = ? AND date = ?`, [req.params.user_id, req.params.date])
      result && result.changes > 0 ? res.status (204).json () : res.status (404).json ()
      next ()
    }
    catch (err) {
      next (err)
    }
  }

  public validateCreate (req: Request) {
    if (!req.body.date) {
      throw new Error ('400:Create new time clock entry: date is required')
    }
    if (!req.body.user_id) {
      throw new Error ('400:Create new time clock entry: user_id is required')
    }
  }

  public validateAccess (req: IRequest) {
    if (!this.isWriteAccess (req) || req.session.hasAdmin ()) {
      return
    }
    if (req.session.hasUserId (Number (req.params.user_id))) {
      return
    }
    if (req.method === 'POST' && req.body && req.body && req.session.hasUserId (Number (req.body.user_id))) {
      return
    }
    throw new Error ('403:Insufficient credentials')
  }
}

