import { Request, Response, NextFunction } from 'express';
import { SingleTable } from '../SingleTable'
import { Database } from '../Database';
import * as Logger from 'bunyan'

export class InvoiceItem extends SingleTable {

  constructor (db: Database, logger: Logger) {
    const schema = {
      id: 'id',
      invoice_id: 'invoice_id',
      description: 'description',
      quantity: 'quantity',
      unit_price: 'unit_price',
    }
    super ('invoice_item', schema, db, logger)
  }

  public async list (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('invoiceItem.list()')
    try {
      const [whereClause, params] = this.sqlGenerator.generate (req.query)
      const sql = `SELECT id, invoice_id, FROM invoice_item ${whereClause}`
      const rows = await this.db.all (sql, params)
      rows ? res.json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  public async items (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('invoice.items()')
    try {
      const sql = `SELECT * FROM invoice_item WHERE invoice_id = ? ORDER BY id`
      const rows = await this.db.all (sql, [req.params.id])
      rows ? res.json (rows) : res.status (404).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  public validateCreate (req: Request) {
    for (const column of ['invoice_id']) {
      if (!req.body[column]) {
        throw new Error (`400:Create new invoice_item: ${column} is required`)
      }
    }
  }
}