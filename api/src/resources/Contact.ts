import { Request, Response, NextFunction } from 'express';
import { SingleTable } from '../SingleTable'
import { Database } from '../Database';
import * as Logger from 'bunyan'

export class Contact extends SingleTable {

  constructor (db: Database, logger: Logger) {
    const schema = {
      id: 'id',
      entity_id: 'entity_id',
      type: 'type',
      entry: 'entry'
    }
    super('contact', schema, db, logger)
  }

  public validateCreate(req: Request) {
    if (!req.body.entity_id) {
      throw new Error ('400:Create new contact: entity id is required')
    }
    if (!req.body.entry) {
      throw new Error ('400:Create new contact: entry is required')
    }
    if (!req.body.type) {
      throw new Error ('400:Create new contact: type is required')
    }
  }

  public async listByEntity (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`contact.listByEntity(${[req.params.id]})`)
    try {
      const sql = 'SELECT id, type, entry FROM contact WHERE entity_id = ?'
      const rows = await this.db.all (sql, [req.params.id])
      rows ? res.json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }
}