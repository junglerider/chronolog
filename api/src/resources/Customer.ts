import { Request } from 'express';
import { SingleTable } from '../SingleTable'
import { Database } from '../Database';
import * as Logger from 'bunyan'

export class Customer extends SingleTable {

  constructor (db: Database, logger: Logger) {
    const schema = {
      id: 'id',
      organisation_id: 'organisation_id',
      name: 'name',
      is_retired: 'is_retired'
    }
    super ('customer', schema, db, logger)
  }

  public validateCreate(req: Request) {
    if (!req.body.name) {
      throw new Error ('400:Create new customer: name is required')
    }
    if (!req.body.organisation_id) {
      throw new Error ('400:Create new customer: organisation_id is required')
    }
  }
}
