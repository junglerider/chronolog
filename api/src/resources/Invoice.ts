import { Request, Response, NextFunction } from 'express';
import { SingleTable } from '../SingleTable'
import { Database } from '../Database';
import * as Logger from 'bunyan'

export class Invoice extends SingleTable {

  constructor (db: Database, logger: Logger) {
    const schema = {
      id: 'i.id',
      invoice_no: 'i.invoice_no',
      customer_id: 'customer_id',
      status: 'i.status',
      date: 'i.date',
      due_date: 'i.due_date',
      address: 'i.address',
      issuer: 'i.issuer',
      currency: 'i.currency',
      net_total: 'i.net_total',
      show_tax: 'i.show_tax',
      tax_rate: 'i.tax_rate',
      tax_amount: 'i.tax_amount',
      grand_total: 'i.grand_total',
      payment_terms: 'i.payment_terms',
      template: 'i.template',
      created_at: 'i.created_at',
      updated_at: 'i.updated_at',
    }
    super ('invoice AS i', schema, db, logger)
  }

  public async list (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('invoice.list()')
    try {
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = `SELECT i.id, invoice_no, date, grand_total, currency, status, c.name AS customer_name FROM invoice i LEFT JOIN customer c ON (c.id = i.customer_id) ${whereClause}`
      const rows = await this.db.all (sql, params)
      rows ? res.json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  public async read (req: Request, res: Response, next: NextFunction) {
    this.logger.trace (`invoice.read(${[req.params.id]}))`)
    const sql = `SELECT i.*, c.organisation_id FROM invoice i JOIN customer c on (i.customer_id = c.id) WHERE i.id = ?`
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
    for (const column of ['invoice_no', 'customer_id', 'status', 'date', 'due_date', 'address', 'currency']) {
      if (!req.body[column]) {
        throw new Error (`400:Create new invoice: ${column} is required`)
      }
    }
  }

}