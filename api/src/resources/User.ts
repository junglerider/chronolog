import { Request, Response, NextFunction } from 'express';
import { SingleTable } from '../SingleTable'
import { Database } from '../Database';
import * as Logger from 'bunyan'

export class User extends SingleTable {

  constructor (db: Database, logger: Logger) {
    const schema = {
      id: 'id',
      person_id: 'person_id',
      login: 'login',
      password: 'password',
      visits: 'visits',
      last_visit: 'last_visit',
      last_task: 'last_task',
      is_active: 'is_active'
    }
    super ('user', schema, db, logger)
  }

  public async list (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('user.list()')
    try {
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = `SELECT user.id, login, first_name || ' ' || last_name AS name, person_id FROM user JOIN person on person.id = user.person_id ` +  whereClause
      const rows = await this.db.all (sql, params)
      rows ? res.json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
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
