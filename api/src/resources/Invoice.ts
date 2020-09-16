import { Request, Response, NextFunction } from 'express';
import { SingleTable } from '../SingleTable'
import { Database } from '../Database';
import * as Logger from 'bunyan'

export class Invoice extends SingleTable {

  constructor (db: Database, logger: Logger) {
    const schema = {
      id: 'id',
      invoice_no: 'invoice_no',
      customer_id: 'customer_id',
      status: 'status',
      date: 'date',
      due_date: 'due_date',
      address: 'address',
      issuer: 'issuer',
      net_total: 'net_total',
      show_tax: 'show_tax',
      tax_rate: 'tax_rate',
      tax_amount: 'tax_amount',
      grand_total: 'grand_total',
      payment_terms: 'payment_terms',
      template: 'template',
      created_at: 'created_at',
      updated_at: 'updated_at',
    }
    super ('invoice', schema, db, logger)
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

  public validateCreate(req: Request) {
    for (const column of ['invoice_no', 'customer_id', 'date', 'due_date', 'address', 'currency', 'net_total', 'grand_total']) {
      if (!req.body[column]) {
        throw new Error (`400:Create new invoice: ${column} is required`)
      }
    }
  }

}