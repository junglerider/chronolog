import * as express from 'express'
import { Application, Request, Response, NextFunction } from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as history from 'connect-history-api-fallback'
import * as rateLimit from 'express-rate-limit'
import * as config from './config.json'
import * as Logger from 'bunyan'

export const logger = Logger.createLogger ({
  name: config.app_name || 'chronolog',
  level: process.env.NODE_ENV == 'production' ? 'info' : (config.log_level as Logger.LogLevel || 'info')
});

import { Database } from './Database'
import { Auth } from './Auth'
import { Organisation } from './resources/Organisation'
import { Person } from './resources/Person'
import { Contact } from './resources/Contact'
import { Employee } from './resources/Employee'
import { User } from './resources/User'
import { Customer } from './resources/Customer'
import { Task } from './resources/Task'
import { TimeLog } from './resources/TimeLog'
import { TimeLogReport } from './resources/TimeLogReport'
import { TimeClock } from './resources/TimeClock'
import { Invoice } from './resources/Invoice'
import { InvoiceItem } from './resources/InvoiceItem'
import { Setting } from './resources/Setting'

const db = new Database (config, logger)
const auth = new Auth (config, db, logger)
const organisation = new Organisation (db, logger)
const person = new Person (db, logger)
const contact = new Contact (db, logger)
const employee = new Employee (db, logger)
const user = new User (db, logger)
const customer = new Customer (db, logger)
const task = new Task (db, logger)
const timelog = new TimeLog (db, logger)
const timelogReport = new TimeLogReport (db, logger)
const timeclock = new TimeClock (db, logger)
const invoice = new Invoice (db, logger)
const invoiceItem = new InvoiceItem (db, logger)
const setting = new Setting (db, logger)

/**
 * Represents the Chronolog API server application.
 */
class App {

  public app: Application

  constructor () {
    this.app = express ()
    this.mountRoutes ()
  }

  // close database when server exits
  public exit () {
    db.close ()
  }

  // pass a simple message to logger
  public log (message: string): void {
    logger.info (message)
  }

  // health check response
  private health (req: Request, res: Response, next: NextFunction): void {
    res.json ({
      name: 'Chronolog API server',
      status: 'ready'
    })
    next ()
  }

  // handle unrecognised routes
  private notFoundHandler (req: Request, res: Response, next: NextFunction): void {
    if (! res.headersSent) {
      const msg = 'Unknown command or resource'
      logger.debug (msg)
      res.status (400).json ( { error: msg })
    }
  }

  // handle errors and output messages with optional HTTP status code, e.g. "400:Invalid"
  private errorHandler (err: Error, req: Request, res: Response, next: NextFunction): void {
    let statusCode = 500
    if (! res.headersSent) {
      let message = err.message
      let parsedErrorMessage = message.match (/^(\d\d\d):(.*)/)
      if (parsedErrorMessage) {
        statusCode = parseInt (parsedErrorMessage [1])
        message = parsedErrorMessage [2]
      }
      if (message.includes ('constraint failed')) {
        statusCode = 409
      }
      res.status (statusCode). json ( { error: message }).end ()
    }
    statusCode >= 500 ? logger.error (err) : logger.warn (err.message)
  }

  private mountRoutes (): void {

    // parse application/x-www-form-urlencoded request body
    this.app.use (bodyParser.json ())

    // parse application/json request body
    this.app.use (bodyParser.urlencoded ({ extended: false }))

    // log requests in debug mode
    this.app.use ((req: Request, res: Response, next: NextFunction): void => {
      logger.debug ({params: req.params, body: req.body}, `Incoming request: ${req.method} ${req.url}`)
      next ()
    })

    // enable CORS requests
    this.app.use (cors ())

    // serve static files of SPA web application
    const webApp = express.static ('app')
    this.app.use (webApp)
    this.app.use (history())
    // 2nd call for redirection
    this.app.use (webApp)

    // health status
    this.app.get ('/health', this.health)

    // rate limit login
    this.app.use ('/auth/login', rateLimit({
      windowMs: 60 * 1000,
      max: config.login_rate_limit || 5
    }))

    // authentication
    this.app.post ('/auth/login', auth.login.bind (auth))
    this.app.post ('/auth/logout', auth.logout.bind (auth))
    this.app.get ('/auth/session', auth.session.bind (auth))

    const api  = express.Router ()
    api.use ((req: Request, res: Response, next: NextFunction): void => {
      if (!auth.authenticate (req)) {
        next (new Error ('401:Authentication error'))
      } else {
        next ()
      }
    })

    // REST resources
    api.get ('/organisation', organisation.list.bind (organisation))
    api.get ('/organisation/count', organisation.count.bind (organisation))
    api.post ('/organisation', organisation.create.bind (organisation))
    api.put ('/organisation/:id(\\d+)', organisation.update.bind (organisation))
    api.get ('/organisation/:id(\\d+)', organisation.read.bind (organisation))
    api.delete ('/organisation/:id(\\d+)', organisation.delete.bind (organisation))
    api.get ('/organisation/:id(\\d+)/persons', organisation.getPersons.bind (organisation))
    api.get ('/organisation/:id(\\d+)/contacts', contact.listByEntity.bind (contact))

    api.get ('/person', person.list.bind (person))
    api.get ('/person/count', person.count.bind (person))
    api.post ('/person', person.create.bind (person))
    api.put ('/person/:id(\\d+)', person.update.bind (person))
    api.get ('/person/:id(\\d+)', person.read.bind (person))
    api.delete ('/person/:id(\\d+)', person.delete.bind (person))
    api.get ('/person/:id(\\d+)/organisations', person.getOrganisations.bind (person))
    api.get ('/person/:id(\\d+)/contacts', contact.listByEntity.bind (contact))

    api.get ('/contact', contact.list.bind (contact))
    api.get ('/contact/count', contact.count.bind (contact))
    api.post ('/contact', contact.create.bind (contact))
    api.get ('/contact/:id(\\d+)', contact.read.bind (contact))
    api.put ('/contact/:id(\\d+)', contact.update.bind (contact))
    api.delete ('/contact/:id(\\d+)', contact.delete.bind (contact))

    api.get ('/employee', employee.list.bind (employee))
    api.get ('/employee/count', employee.count.bind (employee))
    api.post ('/employee', employee.create.bind (employee))
    api.get ('/employee/:id(\\d+)', employee.read.bind (employee))
    api.put ('/employee/:id(\\d+)', employee.update.bind (employee))
    api.delete ('/employee/:id(\\d+)', employee.delete.bind (employee))

    api.get ('/user', user.list.bind (user))
    api.get ('/user/count', user.count.bind (user))
    api.post ('/user', user.create.bind (user))
    api.get ('/user/:id(\\d+)', user.read.bind (user))
    api.put ('/user/:id(\\d+)', user.update.bind (user))
    api.delete ('/user/:id(\\d+)', user.delete.bind (user))
    api.put ('/user/:id(\\d+)/password', auth.updatePassword.bind (auth))
    api.delete ('/user/:id(\\d+)/password', auth.resetPassword.bind (auth))

    api.get ('/customer', customer.list.bind (customer))
    api.get ('/customer/count', customer.count.bind (customer))
    api.post ('/customer', customer.create.bind (customer))
    api.get ('/customer/:id(\\d+)', customer.read.bind (customer))
    api.put ('/customer/:id(\\d+)', customer.update.bind (customer))
    api.delete ('/customer/:id(\\d+)', customer.delete.bind (customer))
    api.get ('/customer/task-count', customer.taskCount.bind (customer))

    api.get ('/task', task.list.bind (task))
    api.get ('/task/count', task.count.bind (task))
    api.post ('/task', task.create.bind (task))
    api.get ('/task/:id(\\d+)', task.read.bind (task))
    api.get ('/task/:id(\\d+)/descendants', task.descendants.bind (task))
    api.put ('/task/:id(\\d+)', task.update.bind (task))
    api.put ('/task/:id(\\d+)/descendants', task.updateDescendants.bind (task))
    api.delete ('/task/:id(\\d+)', task.delete.bind (task))
    api.get ('/task/projects', task.projects.bind (task))
    api.get ('/todo/:userId(\\d+)', task.todoList.bind (task))
    api.get ('/todo/:userId(\\d+)/count', task.todoCount.bind (task))
    api.get ('/todo/:userId(\\d+)/projects', task.projectList.bind (task))

    api.get ('/timelog', timelog.list.bind (timelog))
    api.get ('/timelog/count', timelog.count.bind (timelog))
    api.get ('/timelog/daily', timelog.daily.bind (timelog))
    api.get ('/timelog/sum', timelog.sum.bind (timelog))
    api.post ('/timelog', timelog.create.bind (timelog))
    api.get ('/timelog/:id(\\d+)', timelog.read.bind (timelog))
    api.put ('/timelog/:id(\\d+)', timelog.update.bind (timelog))
    api.delete ('/timelog/:id(\\d+)', timelog.delete.bind (timelog))

    api.get ('/timelog/report', timelogReport.list.bind (timelogReport))

    api.get ('/timeclock', timeclock.list.bind (timeclock))
    api.get ('/timeclock/count', timeclock.count.bind (timeclock))
    api.post ('/timeclock', timeclock.create.bind (timeclock))
    api.get ('/timeclock/:user_id/:date(\\d\\d\\d\\d-\\d\\d-\\d\\d)', timeclock.read.bind (timeclock))
    api.put ('/timeclock/:user_id/:date(\\d\\d\\d\\d-\\d\\d-\\d\\d)', timeclock.update.bind (timeclock))
    api.delete ('/timeclock/:user_id/:date(\\d\\d\\d\\d-\\d\\d-\\d\\d)', timeclock.delete.bind (timeclock))

    api.get ('/invoice', invoice.list.bind (invoice))
    api.get ('/invoice/count', invoice.count.bind (invoice))
    api.post ('/invoice', invoice.create.bind (invoice))
    api.get ('/invoice/:id(\\d+)', invoice.read.bind (invoice))
    api.get ('/invoice/:id(\\d+)/items', invoiceItem.items.bind (invoiceItem))
    api.put ('/invoice/:id(\\d+)', invoice.update.bind (invoice))
    api.delete ('/invoice/:id(\\d+)', invoice.delete.bind (invoice))

    api.get ('/invoice-item', invoiceItem.list.bind (invoiceItem))
    api.get ('/invoice-item/count', invoiceItem.count.bind (invoiceItem))
    api.post ('/invoice-item', invoiceItem.create.bind (invoiceItem))
    api.get ('/invoice-item/:id(\\d+)', invoiceItem.read.bind (invoiceItem))
    api.put ('/invoice-item/:id(\\d+)', invoiceItem.update.bind (invoiceItem))
    api.delete ('/invoice-item/:id(\\d+)', invoiceItem.delete.bind (invoiceItem))

    api.post ('/setting', setting.create.bind (setting))
    api.get ('/setting/:key', setting.read.bind (setting))
    api.get ('/settings/:key', setting.readMany.bind (setting))
    api.put ('/setting/:key', setting.update.bind (setting))
    api.delete ('/setting/:key', setting.delete.bind (setting))

    // rate limit API calls
    this.app.use ('/api', rateLimit({
      windowMs: 60 * 1000,
      max: config.api_rate_limit || 100
    }))

    this.app.use ('/api', api)
    this.app.use (this.notFoundHandler)
    this.app.use (this.errorHandler)
  }
}

export default new App ()