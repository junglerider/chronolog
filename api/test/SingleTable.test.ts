import { SingleTable } from '../src/SingleTable'
import { createMockLogger } from './MockLogger'
import { MockDatabase } from './MockDatabase'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

describe ('SingleTable', () => {

  let instance: SingleTable
  let logger, db, request, response

  const schema = {
    id: 'table.id',
    entity_id: 'table.entity_id',
    name: 'table.name',
    code: 'table.code'
  }

  beforeEach (() => {
    logger = createMockLogger ()
    db = new MockDatabase ()
    instance = new SingleTable ('single_table', schema, db, logger)
    request = new Request ()
    response = new Response ()
  })

  it ('should run a query with empty parameters and return 200 OK with JSON data if list() is called with no filters', done => {
    const next = (error?: any) => {
      expect (error).toBeUndefined ()
      expect (logger.trace).toBeCalled ()
      expect (db.all).toBeCalledWith (expect.stringContaining('SELECT * FROM single_table'), [])
      expect (response.json).toBeCalledWith (expect.any (Array))
      expect (response.status).toBeCalledWith (200)
      done ()
    }
    instance.list (request, response, next)
  })

  it ('should run a query with parameters if list() is called with filters', done => {
    const next = () => {
      expect (db.all).toBeCalledWith (expect.stringContaining('SELECT * FROM single_table WHERE'), ['name'])
      expect (response.json).toBeCalledWith (expect.any (Array))
      expect (response.status).toBeCalledWith (200)
      done ()
    }
    request.setQuery ( { filter: { name: { eq: 'name' } } } )
    instance.list (request, response, next)
  })

  it ('should return a 400 error code if list() is called with invalid filters', done => {
    const next = (error?: any) => {
      expect (error).toBeDefined ()
      expect (error.message).toEqual (expect.stringMatching (/^400:/))
      expect (db.run).not.toBeCalled ()
      expect (response.json).not.toBeCalled ()
      expect (response.status).not.toBeCalled ()
      done ()
    }
    request.setQuery ( { filter: { invalid_field: { invalid_filter: 'name' } } } )
    instance.list (request, response, next)
  })

  it ('should return 404 NotFound with empty body if list() is called and query doesn\'t match anything', done => {
    const next = () => {
      expect (response.status).toBeCalledWith (404)
      expect (response.json).toBeCalled ()
      const data = response.json.mock.calls[0][0]
      expect (data).toBeUndefined ()
      done ()
    }
    db.behaviour.allResult = null
    instance.list (request, response, next)
  })

  it ('should return an error if list() query fails', done => {
    const next = (error?: any) => {
      expect (error).toBeDefined ()
      expect (db.all).toBeCalled ()
      expect (response.status).not.toBeCalled ()
      expect (response.json).not.toBeCalled ()
      done ()
    }
    db.behaviour.callSucceeds = false
    instance.list (request, response, next)
  })

  it ('should run a query with empty parameters and return 200 OK with JSON data if COUNT() is called with no filters', done => {
    const next = (error) => {
      expect (error).toBeUndefined ()
      expect (logger.trace).toBeCalled ()
      expect (db.get).toBeCalledWith (expect.stringContaining('SELECT COUNT(*) AS count FROM single_table'), [])
      expect (response.json).toBeCalledWith (expect.any (Object))
      expect (response.status).toBeCalledWith (200)
      done ()
    }
    instance.count (request, response, next)
  })

  it ('should run a query with parameters if count() is called with filters', done => {
    const next = () => {
      expect (db.get).toBeCalledWith (expect.stringContaining('SELECT COUNT(*) AS count FROM single_table WHERE'), ['name'])
      expect (response.json).toBeCalledWith (expect.any (Object))
      expect (response.status).toBeCalledWith (200)
      done ()
    }
    request.setQuery ( { filter: { name: { eq: 'name' } } } )
    instance.count (request, response, next)
  })

  it ('should return a 400 error code if count() is called with invalid filters', done => {
    const next = (error?: any) => {
      expect (error).toBeDefined ()
      expect (error.message).toEqual (expect.stringMatching (/^400:/))
      expect (db.get).not.toBeCalled ()
      expect (response.json).not.toBeCalled ()
      expect (response.status).not.toBeCalled ()
      done ()
    }
    request.setQuery ( { filter: { invalid_field: { invalid_filter: 'name' } } } )
    instance.count (request, response, next)
  })

  it ('should return an error if count() query fails', done => {
    const next = (error?: any) => {
      expect (error).toBeDefined ()
      expect (db.get).toBeCalled ()
      expect (response.status).not.toBeCalled ()
      expect (response.json).not.toBeCalled ()
      done ()
    }
    db.behaviour.callSucceeds = false
    instance.count (request, response, next)
  })

  it ('should run an INSERT query and return status 201 with id when create() is called', done => {
    const next = (error?: any) => {
      expect (error).toBeUndefined ()
      expect (logger.trace).toBeCalled ()
      expect (db.run).toBeCalledWith (expect.stringContaining('INSERT INTO single_table (name) VALUES (?)'), ['name'])
      expect (response.json).toBeCalledWith (expect.objectContaining ({ id: expect.any (Number) }))
      expect (response.status).toBeCalledWith (201)
      done ()
    }
    request.setBody ( { name: 'name' } )
    instance.create (request, response, next)
  })

  it ('should return a 400 error code if create() is called with no data to insert', done => {
    const next = (error?: any) => {
      expect (error).toBeDefined ()
      expect (error.message).toEqual (expect.stringMatching (/^400:/))
      expect (db.run).not.toBeCalled ()
      expect (response.json).not.toBeCalled ()
      expect (response.status).not.toBeCalled ()
      done ()
    }
    instance.create (request, response, next)
  })

  it ('should return an error if create() is called and the INSERT query fails', done => {
    const next = (error?: any) => {
      expect (error).toBeDefined ()
      expect (response.json).not.toBeCalled ()
      expect (response.status).not.toBeCalled ()
      done ()
    }
    db.behaviour.callSucceeds = false
    instance.create (request, response, next)
  })

  it ('should return an error if create() is called and the database does not provide an insert id', done => {
    const next = (error?: any) => {
      expect (error).toBeDefined ()
      expect (response.json).not.toBeCalled ()
      expect (response.status).not.toBeCalled ()
      done ()
    }
    db.behaviour.runResult = { lastID: undefined, changes: undefined }
    instance.create (request, response, next)
  })

  it ('should execute a SELECT query and retrieve a single record if read() is called', done => {
    const next = (error?: any) => {
      expect (error).toBeUndefined ()
      expect (logger.trace).toBeCalled ()
      expect (db.get).toBeCalledWith (expect.stringContaining('SELECT * FROM single_table WHERE id = ?'), [123])
      expect (response.json).toBeCalledWith (expect.any (Object))
      expect (response.status).toBeCalledWith (200)
      done ()
    }
    request.setParams ( { id: 123 } )
    instance.read (request, response, next)
  })

  it ('should return 404 NotFound if read() SELECT query doesn\'t match any record', done => {
    const next = (error?: any) => {
      expect (error).toBeUndefined ()
      const data = response.json.mock.calls[0][0]
      expect (data).toBeUndefined ()
      expect (response.status).toBeCalledWith (404)
      done ()
    }
    request.setParams ( { id: 123 } )
    db.behaviour.getResult = null
    instance.read (request, response, next)
  })

  it ('should return an error if read() is called and the SELECT query fails', done => {
    const next = (error?: any) => {
      expect (error).toBeDefined ()
      expect (response.json).not.toBeCalled ()
      expect (response.status).not.toBeCalled ()
      done ()
    }
    db.behaviour.callSucceeds = false
    instance.create (request, response, next)
  })

  it ('should run an UPDATE query and return status 204 if update() is called', done => {
    const next = (error?: any) => {
      expect (error).toBeUndefined ()
      expect (logger.trace).toBeCalled ()
      console.log ()
      expect (db.run).toBeCalledWith (expect.stringContaining('UPDATE single_table SET name = ?'), ['name', 123])
      const data = response.json.mock.calls[0][0]
      expect (data).toBeUndefined ()
      expect (response.status).toBeCalledWith (204)
      done ()
    }
    request.setBody ( { name: 'name' } )
    request.setParams ( { id: 123 } )
    instance.update (request, response, next)
  })

  it ('should return a 400 status code if update() is called with no data to update', done => {
    const next = (error?: any) => {
      expect (db.run).not.toBeCalled ()
      const data = response.json.mock.calls[0][0]
      expect (data).toBeUndefined ()
      expect (response.status).toBeCalledWith (400)
      done ()
    }
    instance.update (request, response, next)
  })

  it ('should return a 404 status code if update() is called and the record cannot be found', done => {
    const next = (error?: any) => {
      expect (db.run).toBeCalled ()
      const data = response.json.mock.calls[0][0]
      expect (data).toBeUndefined ()
      expect (response.status).toBeCalledWith (404)
      done ()
    }
    request.setBody ( { name: 'name' } )
    db.behaviour.runResult = { lastID: undefined, changes: 0 }
    instance.update (request, response, next)
  })

  it ('should return an error if update() is called and the UPDATE query fails', done => {
    const next = (error?: any) => {
      expect (error).toBeDefined ()
      expect (response.json).not.toBeCalled ()
      expect (response.status).not.toBeCalled ()
      done ()
    }
    request.setBody ( { name: 'name' } )
    db.behaviour.callSucceeds = false
    instance.update (request, response, next)
  })

  it ('should run an DELETE query and return status 204 if delete() is called', done => {
    const next = (error?: any) => {
      expect (error).toBeUndefined ()
      expect (logger.trace).toBeCalled ()
      expect (db.run).toBeCalledWith (expect.stringContaining('DELETE FROM single_table WHERE id = ?'), [777])
      const data = response.json.mock.calls[0][0]
      expect (data).toBeUndefined ()
      expect (response.status).toBeCalledWith (204)
      done ()
    }
    request.setParams ( { id: 777 } )
    instance.delete (request, response, next)
  })

  it ('should return a 404 status code if delete() is called and the record cannot be found', done => {
    const next = (error?: any) => {
      expect (error).toBeUndefined ()
      expect (db.run).toBeCalled ()
      const data = response.json.mock.calls[0][0]
      expect (data).toBeUndefined ()
      expect (response.status).toBeCalledWith (404)
      done ()
    }
    request.setParams ( { id: 777 } )
    db.behaviour.runResult = { lastID: undefined, changes: 0 }
    instance.delete (request, response, next)
  })

  it ('should return an error if deleete() is called and the DELETE query fails', done => {
    const next = (error?: any) => {
      expect (error).toBeDefined ()
      expect (response.json).not.toBeCalled ()
      expect (response.status).not.toBeCalled ()
      done ()
    }
    request.setParams ( { id: 777 } )
    db.behaviour.callSucceeds = false
    instance.delete (request, response, next)
  })
})