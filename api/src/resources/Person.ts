import { Request, Response, NextFunction } from 'express';
import { SqlGenerator } from '../SqlGenerator'
import { Database } from '../Database';
import * as Logger from 'bunyan'

export class Person {

  private db: Database
  private logger: Logger
  private sqlGenerator: SqlGenerator

  private schema = {
    id: 'p.id',
    type: 'p.type',
    title: 'p.title',
    first_name: 'p.first_name',
    last_name: 'p.last_name',
    nick_name: 'p.nick_name',
    street_address: 'e.street_address',
    city: 'e.city',
    state_province: 'e.state_province',
    postcode: 'e.postcode',
    country: 'e.country',
    comment: 'e.comment',
    first_contact: 'e.first_contact',
    last_contact: 'e.last_contact',
    updated_at: 'e.updated_at'
  }

  constructor (db: Database, logger: Logger) {
    this.db = db
    this.logger = logger;
    this.sqlGenerator = new SqlGenerator (logger, this.schema)
  }

  public async list (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('Person.list()')
    try {
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = 'SELECT p.id, p.type, p.title, p.first_name, p.last_name, p.first_name || " " || p.last_name AS name, e.city, e.country FROM person p JOIN entity e ON e.id = p.id ' + whereClause
      const rows = await this.db.all (sql, params)
      rows ? res.status (200).json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  public async count (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('Person.count()')
    try {
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = 'SELECT COUNT(*) AS count FROM person p JOIN entity e ON e.id = p.id ' + whereClause
      const row = await this.db.get (sql, params)
      row ? res.status (200).json (row) : res.status (404)
      next ()
    } catch (err) {
      next (err)
    }
  }

  public async create (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('Person.create()')
    if (!req.body.first_name && !req.body.last_name) {
      return res.status (400).json ()
    }
    try {
      await this.db.run ('BEGIN TRANSACTION')
      let [ names, values ] = this.sqlGenerator.buildParameterList (req.body, 'e.')
      let sql = `INSERT INTO entity (${ names.join (', ') }) VALUES (${ names.map (n => '?').join (', ') })`
      let result: any = await this.db.run (sql, values)
      const id = result.lastID
      if (!id) {
        throw new Error('Could not create person entity')
      }
      [ names, values ] = this.sqlGenerator.buildParameterList (req.body, 'p.')
      names.push ('id')
      values.push (id)
      sql = `INSERT INTO person (${ names.join (', ') }) VALUES (${ names.map (n => '?').join (', ') })`
      result = await this.db.run (sql, values)
      if (!result.lastID) {
        throw new Error('Could not create person record')
      }
      await this.db.run ('COMMIT')
      res.status (201).json ({id: id})
      next ()
    }
    catch (err) {
      await this.db.run ('ROLLBACK')
      next (err)
    }
  }

  public async update (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`Person.update(${[req.params.id]})`)
    try {
      await this.db.run ('BEGIN TRANSACTION')
      let tablesToUpdate = 0
      let tablesUpdated = 0
      let [ names, values ] = this.sqlGenerator.buildParameterList (req.body, 'e.')
      if (names.length > 0) {
        tablesToUpdate += 1
        const sql = 'UPDATE entity SET ' + names.map (name => `${name} = ?`).join (', ') + ' WHERE id = ' + req.params.id
        const result: any = await this.db.run (sql, values)
        tablesUpdated += result.changes
      }
      [ names, values ] = this.sqlGenerator.buildParameterList (req.body, 'p.')
      if (names.length > 0) {
        tablesToUpdate += 1
        const sql = 'UPDATE person SET ' + names.map (name => `${name} = ?`).join (', ') + ' WHERE id = ' + req.params.id
        const result: any = await this.db.run (sql, values)
        tablesUpdated += result.changes
      }
      await this.db.run ('COMMIT')
      res.status (tablesToUpdate > 0 ? (tablesUpdated > 0 ? 204 : 404) : 400).json()
      next ()
    }
    catch (err) {
      await this.db.run ('ROLLBACK')
      next (err)
    }
  }

  public async read (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`Person.read(${[req.params.id]})`)
    const sql = 'SELECT * FROM person p JOIN entity e ON e.id = p.id WHERE p.id = ?'
    try {
      let row = await this.db.get (sql, [req.params.id])
      row ? res.status (200).json (row) : res.status (404).json ()
      next ()
    }
    catch (err) {
      next (err)
    }
  }

  public async delete (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`Person.delete(${[req.params.id]})`)
    try {
      let result: any = undefined
      const row = await this.db.get ('SELECT * FROM person WHERE id = ?', [req.params.id])
      if (row) {
        result = await this.db.run ('DELETE FROM entity WHERE id = ?', [req.params.id])
      }
      result && result.changes > 0 ? res.status (204).json () : res.status (404).json ()
      next ()
    }
    catch (err) {
      next (err)
    }
  }

  public async getOrganisations (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`Person.getOrganisations(${[req.params.id]})`)
    try {
      const sql = 'SELECT o.id AS organisation_id, e.id AS employee_id, o.name, e.position FROM employee e JOIN organisation o ON e.organisation_id = o.id WHERE e.person_id = ?'
      const rows = await this.db.all (sql, [req.params.id])
      rows ? res.status (200).json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }
}
