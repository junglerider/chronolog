import { Request } from 'express'
import { Database } from '../Database'
import { SingleTable } from '../SingleTable'
import * as Logger from 'bunyan'

export class Employee extends SingleTable {

  constructor (db: Database, logger: Logger) {
    const schema = {
      id: 'id',
      organisation_id: 'organisation_id',
      person_id: 'person_id',
      position: 'position'
    }
    super ('employee', schema, db, logger)
  }

  public validateCreate(req: Request) {
    if (!req.body.organisation_id) {
      throw new Error ('400:Create new employee: organisation id is required')
    }
    if (!req.body.person_id) {
      throw new Error ('400:Create new employee: person id is required')
    }
  }
}
