import { Request, Response, NextFunction } from 'express';
import { SingleTable } from '../SingleTable'
import { Database } from '../Database';
import * as Logger from 'bunyan'

export class User extends SingleTable {

  constructor (db: Database, logger: Logger) {
    const schema = {
      id: 'u.id',
      person_id: 'u.person_id',
      login: 'u.login',
      password: 'u.password',
      visits: 'u.visits',
      last_visit: 'u.last_visit',
      last_task: 'u.last_task',
      is_active: 'u.is_active'
    }
    super ('user AS u', schema, db, logger)
  }

  public async list (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('user.list()')
    try {
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = `SELECT u.id, u.login, u.is_active, first_name || ' ' || last_name AS name, person_id FROM user u JOIN person on person.id = u.person_id ` +  whereClause
      const rows = await this.db.all (sql, params)
      rows ? res.json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  public async read (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`user.read(${[req.params.id]}))`)
    const sql = `SELECT u.*, p.first_name, p.last_name, p.nick_name from user u JOIN person p on p.id = u.person_id WHERE u.id = ?`
    try {
      let row = await this.db.get (sql, [req.params.id])
      row ? res.status (200).json (row) : res.status (404).json ()
      next ()
    }
    catch (err) {
      next (err)
    }
  }

  public validateCreate(req: Request) {
    if (!req.body.login) {
      throw new Error ('400:Create new user: login name is required')
    }
    if (!req.body.person_id) {
      throw new Error ('400:Create new customer: person_id is required')
    }
  }
}
