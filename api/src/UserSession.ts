import { Request } from 'express'

/**
 * Encapsulates user session data.
 *
 * Used for access control.
 *
 */

export interface IUserSession {
  time: number,
  id: number,
  username: string
  name: string
  roles: string []
}

export interface IRequest extends Request {
  session?: UserSession
}

export class UserSession {

  private session: IUserSession

  constructor (session: IUserSession) {
    this.session = session
  }

  public hasAdmin (): boolean {
    return this.session.roles.includes ('admin')
  }

  public hasInvoicing (): boolean {
    return this.session.roles.includes ('invoicing') || this.session.roles.includes ('admin')
  }

  public hasReporting (): boolean {
    return this.session.roles.includes ('reporting') || this.session.roles.includes ('admin')
  }

  public hasContacts (): boolean {
    return this.session.roles.includes ('contacts') || this.session.roles.includes ('admin')
  }

  public hasUserId (id: number): boolean {
    return id === this.session.id
  }
}