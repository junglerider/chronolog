import * as express from 'express'
import { Application, Request, Response, NextFunction } from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as history from 'connect-history-api-fallback'

import * as config from './config.json'
import * as Logger from 'bunyan'

export const logger = Logger.createLogger({
  name: config.app_name || 'chronolog',
  level: process.env.NODE_ENV == 'production' ? 'info' : (config.log_level as Logger.LogLevel || 'info')
});

import { Database } from './Database'
import { Organisation } from './resources/Organisation'
import { Person } from './resources/Person'
import { Contact } from './resources/Contact'
import { Employee } from './resources/Employee'
import { User } from './resources/User'
import { Customer } from './resources/Customer'
import { Task } from './resources/Task'
import { TimeLog } from './resources/TimeLog'
import { TimeLogReport } from './resources/TimeLogReport'

const db = new Database (config, logger)
const organisation = new Organisation (db, logger)
const person = new Person (db, logger)
const contact = new Contact (db, logger)
const employee = new Employee (db, logger)
const user = new User (db, logger)
const customer = new Customer (db, logger)
const task = new Task (db, logger)
const timelog = new TimeLog (db, logger)
const timelogReport = new TimeLogReport (db, logger)

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

  // handle unrecognized routes
  private notFoundHandler (req: Request, res: Response, next: NextFunction): void {
    if (! res.headersSent) {
      res.status (400).json ( { error: 'Unknown command or resource' })
    }
  }

  // handle errors and ouput messages with optional HTTP status code, e.g. "400:Invalid"
  private errorHandler (err: Error, req: Request, res: Response, next: NextFunction): void {
    logger.error (err)
    if (! res.headersSent) {
      let message = err.message
      let statusCode = '500'
      let parsedErrorMessage = message.match (/^(\d\d\d):(.*)/)
      if (parsedErrorMessage) {
        statusCode = parsedErrorMessage [1]
        message = parsedErrorMessage [2]
      }
      if (message.includes('constraint failed')) {
        statusCode = '409'
      }
      res.status (parseInt (statusCode)). json ( { error: message }).end ()
    }
  }

  private mountRoutes (): void {

    // parse application/x-www-form-urlencoded request body
    this.app.use (bodyParser.json())

    // parse application/json request body
    this.app.use (bodyParser.urlencoded({ extended: false }))

    this.app.use ((req: Request, res: Response, next: NextFunction): void => {
      logger.debug ({params: req.params, body: req.body}, `Incoming request: ${req.method} ${req.url}`)
      next()
    })

    // enable CORS requests
    this.app.use (cors ())

    // serve static files of SPA web application
    const webApp = express.static('app')
    this.app.use(webApp)
    this.app.use(history())
    // 2nd call for redirection
    this.app.use(webApp)

    // health status
    this.app.get ('/health', this.health)

    // REST resources
    this.app.get ('/organisation', organisation.list.bind (organisation))
    this.app.get ('/organisation/count', organisation.count.bind (organisation))
    this.app.post ('/organisation', organisation.create.bind (organisation))
    this.app.put ('/organisation/:id(\\d+)', organisation.update.bind (organisation))
    this.app.get ('/organisation/:id(\\d+)', organisation.read.bind (organisation))
    this.app.delete ('/organisation/:id(\\d+)', organisation.delete.bind (organisation))
    this.app.get ('/organisation/:id(\\d+)/persons', organisation.getPersons.bind (organisation))
    this.app.get ('/organisation/:id(\\d+)/contacts', contact.listByEntity.bind (contact))

    this.app.get ('/person', person.list.bind (person))
    this.app.get ('/person/count', person.count.bind (person))
    this.app.post ('/person', person.create.bind (person))
    this.app.put ('/person/:id(\\d+)', person.update.bind (person))
    this.app.get ('/person/:id(\\d+)', person.read.bind (person))
    this.app.delete ('/person/:id(\\d+)', person.delete.bind (person))
    this.app.get ('/person/:id(\\d+)/organisations', person.getOrganisations.bind (person))
    this.app.get ('/person/:id(\\d+)/contacts', contact.listByEntity.bind (contact))

    this.app.get ('/contact', contact.list.bind (contact))
    this.app.get ('/contact/count', contact.count.bind (contact))
    this.app.post ('/contact', contact.create.bind (contact))
    this.app.get ('/contact/:id(\\d+)', contact.read.bind (contact))
    this.app.put ('/contact/:id(\\d+)', contact.update.bind (contact))
    this.app.delete ('/contact/:id(\\d+)', contact.delete.bind (contact))

    this.app.get ('/employee', employee.list.bind (employee))
    this.app.get ('/employee/count', employee.count.bind (employee))
    this.app.post ('/employee', employee.create.bind (employee))
    this.app.get ('/employee/:id(\\d+)', employee.read.bind (employee))
    this.app.put ('/employee/:id(\\d+)', employee.update.bind (employee))
    this.app.delete ('/employee/:id(\\d+)', employee.delete.bind (employee))

    this.app.get ('/user', user.list.bind (user))
    this.app.get ('/user/count', user.count.bind (user))
    this.app.post ('/user', user.create.bind (user))
    this.app.get ('/user/:id(\\d+)', user.read.bind (user))
    this.app.put ('/user/:id(\\d+)', user.update.bind (user))
    this.app.delete ('/user/:id(\\d+)', user.delete.bind (user))

    this.app.get ('/customer', customer.list.bind (customer))
    this.app.get ('/customer/count', customer.count.bind (customer))
    this.app.post ('/customer', customer.create.bind (customer))
    this.app.get ('/customer/:id(\\d+)', customer.read.bind (customer))
    this.app.put ('/customer/:id(\\d+)', customer.update.bind (customer))
    this.app.delete ('/customer/:id(\\d+)', customer.delete.bind (customer))
    this.app.get ('/customer/task-count', customer.taskCount.bind (customer))

    this.app.get ('/task', task.list.bind (task))
    this.app.get ('/task/count', task.count.bind (task))
    this.app.post ('/task', task.create.bind (task))
    this.app.get ('/task/:id(\\d+)', task.read.bind (task))
    this.app.put ('/task/:id(\\d+)', task.update.bind (task))
    this.app.delete ('/task/:id(\\d+)', task.delete.bind (task))
    this.app.get ('/todo/:userId(\\d+)', task.todoList.bind (task))
    this.app.get ('/todo/:userId(\\d+)/count', task.todoCount.bind (task))
    this.app.get ('/todo/:userId(\\d+)/projects', task.projectList.bind (task))

    this.app.get ('/timelog', timelog.list.bind (timelog))
    this.app.get ('/timelog/count', timelog.count.bind (timelog))
    this.app.get ('/timelog/daily', timelog.daily.bind (timelog))
    this.app.get ('/timelog/sum', timelog.sum.bind (timelog))
    this.app.post ('/timelog', timelog.create.bind (timelog))
    this.app.get ('/timelog/:id(\\d+)', timelog.read.bind (timelog))
    this.app.put ('/timelog/:id(\\d+)', timelog.update.bind (timelog))
    this.app.delete ('/timelog/:id(\\d+)', timelog.delete.bind (timelog))

    this.app.get ('/timelog/report', timelogReport.list.bind (timelogReport))

    this.app.use (this.notFoundHandler)
    this.app.use (this.errorHandler)
  }
}

export default new App()