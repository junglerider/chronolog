import * as crypto from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { Database } from './Database'
import * as Logger from 'bunyan'
import { threadId } from 'worker_threads'

export class Auth {

  protected db: Database
  protected logger: Logger
  private sessions
  private config

  constructor (config, db: Database, logger: Logger) {
    this.config = config
    this.db = db
    this.logger = logger
    this.sessions = new Map()
    setInterval(this.sessionTimeout.bind(this), 60000)
  }

  private hash (password: string): string {
    return crypto.createHash ('sha256').update (password).digest ('hex')
  }

  private compare (givenPwd: string, storedPwd: string): boolean {
    if (!storedPwd) {
      return true
    }
    const hashedPwd = this.hash (givenPwd)
    return hashedPwd === storedPwd
  }

  public async login (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('Auth.login()')
    try {
      const sql = 'SELECT * FROM user WHERE is_active > 0 AND login = ?'
      const row: any = await this.db.get (sql, [req.body.username || ''])
      if (row) {
        const isVerified = this.compare (req.body.password || '', row.password)
        if (isVerified) {
          row.token = this.createSession(row.id, this.getToken (req))
          res.status (200).json (row)
        } else {
          res.status (401).json ()
        }
      } else {
        res.status (404).json ()
      }
      next ()
    } catch (err) {
      next (err)
    }
  }

  public async logout (req: Request, res: Response, next: NextFunction) {
    const token = this.getToken (req)
    if (token && this.sessions.has (token)) {
      this.sessions.delete (token)
      this.logger.debug(`Removed session token ${token}, total = ${this.sessions.size} sessions`)
      res.status (205).json ()
    } else {
      res.status (400).json ()
    }
    next ()
  }

  public authenticate (req: Request): boolean {
    const token = this.getToken (req)
    return token && this.sessions.has(token)
  }

  private createSession (userId, existingToken) {
    if (existingToken && this.sessions.has (existingToken)) {
      const session = this.sessions.get (existingToken)
      session.time = Date.now ()
      this.logger.debug(`Returned session for user ${userId}, total = ${this.sessions.size} sessions`)
      return existingToken
    }
    const token = crypto.randomBytes (32).toString ('base64')
    const session = {
      time: Date.now (),
      userId: userId,
    }
    this.sessions.set(token, session)
    this.logger.debug(`Created session for user ${userId}, total = ${this.sessions.size} sessions`)
    return token
  }

  private getToken (req: Request): string | undefined {
    if (req.headers.authorization) {
      return String(req.headers.authorization).substr(6).trim()
    }
    return undefined
  }

  public async updatePassword (req: Request, res: Response, next: NextFunction) {
    this.logger.trace ('Auth.updatePassword()')
    try {
      const password = this.hash (req.body.password)
      const sql = 'UPDATE user SET password = ? WHERE id = ?'
      const result: any = await this.db.run (sql, [password, req.params.id])
      res.status (result.changes ? 204 : 500).json ()
      next ()
    } catch (err) {
      next (err)
    }
  }

  private sessionTimeout() {
    const now = Date.now ()
    this.sessions.forEach ((session, token) => {
      if (now - session.time > this.config.session_timeout) {
        this.sessions.delete (token)
        this.logger.debug(`Timed out session with token ${token}, total = ${this.sessions.size} sessions`)
      }
    })
  }
}
