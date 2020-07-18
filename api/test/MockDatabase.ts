import { Database } from '../src/Database'

export class MockDatabase extends Database {

  public behaviour = null

  constructor (behaviour = {
    error: new Error ('Database mock threw error'),
    callSucceeds: true,
    runResult: { lastID: 111, changes: 1 },
    getResult:  {id: 1 },
    allResult: [ { id: 1 }, { id: 2 } ]
  }) {
    super ({}, {})
    this.behaviour = behaviour
  }

  public open = jest.fn ().mockImplementation (() => {
    return new Promise ((resolve, reject) => {
      this.behaviour.callSucceeds ? resolve (true) : reject (this.behaviour.error)
    })
  })

  public close = jest.fn ().mockImplementation (() => {
    return new Promise ((resolve, reject) => {
      this.behaviour.callSucceeds ? resolve (true) : reject (this.behaviour.error)
    })
  })

  public run = jest.fn ().mockImplementation (() => {
    return new Promise ((resolve, reject) => {
      this.behaviour.callSucceeds ? resolve (this.behaviour.runResult) : reject (this.behaviour.error)
    })
  })

  public get = jest.fn ().mockImplementation (() => {
    return new Promise ((resolve, reject) => {
      this.behaviour.callSucceeds ? resolve (this.behaviour.getResult) : reject (this.behaviour.error)
    })
  })

  public all = jest.fn ().mockImplementation (() => {
    return new Promise ((resolve, reject) => {
      this.behaviour.callSucceeds ? resolve (this.behaviour.allResult) : reject (this.behaviour.error)
    })
  })

  public each = jest.fn ().mockImplementation (() => {
    return new Promise ((resolve, reject) => {
      this.behaviour.callSucceeds ? resolve (this.behaviour.getResult) : reject (this.behaviour.error)
    })
  })
}
