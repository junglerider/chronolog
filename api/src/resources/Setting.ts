import { Request, Response, NextFunction } from 'express';
import { SingleTable } from '../SingleTable'
import { Database } from '../Database';
import * as Logger from 'bunyan'

export class Setting extends SingleTable {

  constructor (db: Database, logger: Logger) {
    const schema = {
      key: 'key',
      value: 'value',
    }
    super ('setting', schema, db, logger, 'key')
  }

  public async readMany (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('setting.readMany()')
    try {
      const term = req.params.key.indexOf('%') >= 0 ? req.params.key : req.params.key + '%'
      const sql = `SELECT * FROM setting WHERE key LIKE ?`
      const rows = await this.db.all (sql, [term])
      rows ? res.status (200).json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  public validateCreate (req: Request) {
    if (!req.body.key) {
      throw new Error (`400:Create new setting: key is required`)
    }
  }
}