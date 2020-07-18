import { SqlGenerator } from '../src/SqlGenerator'
import { createMockLogger } from './MockLogger'

describe ('SqlGenerator', () => {

  let instance: SqlGenerator
  let logger

  const schema = {
    id: 'table.id',
    entity_id: 'table.entity_id',
    name: 'table.name',
    code: 'table.code'
  }

  beforeEach (() => {
    logger = createMockLogger ()
    instance = new SqlGenerator (logger, schema)
  })

  it ('should generate empty string and empty params if query is empty', () => {
    expect (instance).toBeInstanceOf (SqlGenerator)
    const [sql, params] = instance.generate ({})
    expect (sql).toEqual ('')
    expect (Array.isArray (params))
    expect (params.length).toEqual (0)
  })

  it ('should validate query parameters and log unrecognized/invalid parameters', () => {
    const query1 = {
      limit: '10',
      unrecognizedArray: [ 1, 2, 3 ]
    }
    expect (() => instance.generate (query1)).toThrow ()
    const query2 = {
      order: 'name:asc',
      unrecognizedString: 'abc'
    }
    expect (() => instance.generate (query2)).toThrow ()
  })

  it ('should generate a correct SQL WHERE clause with equality comparison for each of two valid notations', () => {
    let query1 = { filter: { name: 'Charles' } }
    const [sql1, params1] = instance.generate (query1)
    expect (sql1).toEqual ('WHERE table.name = ?')
    expect (params1[0]).toEqual ('Charles')
    let query2 = { filter: { name: { eq: 'Cheryl' } } }
    const [sql2, params2] = instance.generate (query2)
    expect (sql2).toEqual ('WHERE table.name = ?')
    expect (params2[0]).toEqual ('Cheryl')
  })

  it ('should generate a correct SQL WHERE clause with "<>" comparison for "neq" operator', () => {
    let query = { filter: { name: { neq: 'Aron' } } }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('WHERE table.name <> ?')
    expect (params[0]).toEqual ('Aron')
  })

  it ('should generate a correct SQL WHERE clause with "<" comparison for "lt" operator', () => {
    let query = { filter: { code: { lt: '180' } } }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('WHERE table.code < ?')
    expect (params[0]).toEqual ('180')
  })

  it ('should generate a correct SQL WHERE clause with ">" comparison for "gt" operator', () => {
    let query = { filter: { code: { gt: '0' } } }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('WHERE table.code > ?')
    expect (params[0]).toEqual ('0')
  })

  it ('should generate a correct SQL WHERE clause with "<+" comparison for "lte" operator', () => {
    let query = { filter: { code: { lte: '150' } } }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('WHERE table.code <= ?')
    expect (params[0]).toEqual ('150')
  })

  it ('should generate a correct SQL WHERE clause with ">=" comparison for "gte" operator', () => {
    let query = { filter: { code: { gte: '-3' } } }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('WHERE table.code >= ?')
    expect (params[0]).toEqual ('-3')
  })

  it ('should generate a correct SQL WHERE clause with "LIKE" comparison for "like" operator', () => {
    let query = { filter: { name: { like: 'Will%' } } }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('WHERE table.name LIKE ?')
    expect (params[0]).toEqual ('Will%')
  })

  it ('should generate a correct SQL WHERE clause with "IN" comparison for "in" operator', () => {
    let query = { filter: { name: { in: 'Aron,Aram,Anton' } } }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('WHERE table.name IN ?')
    expect (params[0]).toEqual (['Aron', 'Aram', 'Anton'])
  })

  it ('should generate a correct SQL WHERE clause with "NOT IN" comparison for "notin" operator', () => {
    let query = { filter: { name: { notin: 'Bill,Bernie,Barnes' } } }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('WHERE table.name NOT IN ?')
    expect (params[0]).toEqual (['Bill', 'Bernie', 'Barnes'])
  })

  it ('should throw an error if a filter expression has an unrecognized comparison operator', () => {
    let query = { filter: { name: { unrecognized: 'something' } } }
    expect (() => instance.generate (query)).toThrow ()
  })

  it ('should generate SQL clauses in the correct order', () => {
    let query = {
      order: "code:desc",
      limit: '20',
      offset: '60',
      filter: { name: 'Walter' }
    }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('WHERE table.name = ? ORDER BY table.code DESC LIMIT 20 OFFSET 60')
    expect (params[0]).toEqual ('Walter')
  })

  it ('should connect multiple comparisons in a SQL WHERE clause with logical AND', () => {
    let query = {
      filter: { name: 'Sophie', code: '3989' }
    }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('WHERE table.name = ? AND table.code = ?')
    expect (params).toEqual (['Sophie', '3989'])
  })

  it ('should connect multiple different comparisons in a SQL WHERE clause with logical AND', () => {
    let query = {
      filter: { name: { neq: 'Lydia' }, code: { gt: '1260' } }
    }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('WHERE table.name <> ? AND table.code > ?')
    expect (params).toEqual (['Lydia', '1260'])
  })

  it ('should connect multiple comparisons in a SQL WHERE clause with logical OR if specified', () => {
    let query = {
      filter: { id: { lte: '3000' }, name: 'Jacques' },
      combine: 'OR'
    }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('WHERE table.id <= ? OR table.name = ?')
    expect (params).toEqual (['3000', 'Jacques'])
  })

  it ('should create an SQL WHERE clause with multiple comparisons from array value', () => {
    let query = {
      filter: { name: { neq: ['Doris', 'Donald', 'Dania'] } },
    }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('WHERE table.name <> ? AND table.name <> ? AND table.name <> ?')
    expect (params).toEqual (['Doris', 'Donald', 'Dania'])
  })

  it ('should throw an error if the "combine" parameter is unrecognized', () => {
    const query = {
      filter: { id: { gt: '1000' }, name: 'Mariana' },
      combine: 'NOR'
    }
    expect (() => instance.generate (query)).toThrow ()
  })

  it ('should throw an error if a filter field of the WHERE clause is unrecognized', () => {
    const query = {
      filter: { id: { lt: '99' }, unrecognized: 'value' },
    }
    expect (() => instance.generate (query)).toThrow ()
  })

  it ('should throw an error if a filter expression is unrecognized', () => {
    const query = {
      filter: { name: 'Hannah', id: true },
    }
    expect (() => instance.generate (query)).toThrow ()
  })

  it ('should generate SQL with correct LIMIT and OFFSET values', () => {
    const query = {
      limit: '12',
      offset: '34'
    }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('LIMIT 12 OFFSET 34')
  })

  it ('should generate SQL with correct LIMIT and OFFSET values for page numbers', () => {
    const query = {
      limit: '11',
      page: '5'
    }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('LIMIT 11 OFFSET 55')
  })

  it ('should generate SQL with no LIMIT and OFFSET values if LIMIT is not specified', () => {
    const query = {
      offset: '10'
    }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('')
  })

  it ('should throw an error if LIMIT value is not a number', () => {
    const query = {
      limit: 'invalid'
    }
    expect (() => instance.generate (query)).toThrow ()
  })

  it ('should generate correct ORDER BY clause', () => {
    const query = {
      order: 'name'
    }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('ORDER BY table.name')
    expect (Array.isArray (params))
    expect (params.length).toEqual (0)
  })

  it ('should generate correct ORDER BY clause with multiple columns separated by comma', () => {
    const query = {
      order: 'name,code'
    }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('ORDER BY table.name, table.code')
  })

  it ('should generate correct ORDER BY clause with multiple columns and sort direction', () => {
    const query = {
      order: 'code:asc,id:desc'
    }
    const [sql, params] = instance.generate (query)
    expect (sql).toEqual ('ORDER BY table.code ASC, table.id DESC')
  })

  it ('should throw an error if ORDER BY field is not recognized', () => {
    const query = {
      order: 'unrecognized:desc'
    }
    expect (() => instance.generate (query)).toThrow ()
  })

  it ('should throw an error if sort direction is invalid', () => {
    const query = {
      order: 'name:unrecognized'
    }
    expect (() => instance.generate (query)).toThrow ()
  })

  it ('should generate a generic parameter list from a data object', () => {
    const data = { entity_id: 123, name: 'Suchai', code: 'ABC500' }
    let result = instance.buildParameterList (data)
    expect (result).toEqual ([
      ['table.entity_id', 'table.name', 'table.code'],
      [ 123, 'Suchai', 'ABC500' ]
    ])
  })

  it ('should ignore id field when generating a parameter list', () => {
    const data = { id: 123, name: 'Suchai', code: 'ABC500' }
    let result = instance.buildParameterList (data)
    expect (result).toEqual ([
      ['table.name', 'table.code'],
      ['Suchai', 'ABC500' ]
    ])
  })

  it ('should generate a parameter list without prefixes from a data object', () => {
    const data = { entity_id: 999, name: 'Marilyn', code: 'ZXT077' }
    const result = instance.buildParameterList (data, 'table.')
    expect (result).toEqual ([
      ['entity_id', 'name', 'code'],
      [ 999, 'Marilyn', 'ZXT077' ]
    ])
  })

  it ('should generate a partial mapped parameter list from a data object', () => {
    Object.defineProperty (instance, 'schema', { value: {
      firstName: 'p.first_name',
      lastName: 'p.last_name',
      position: 'p.position',
      salary: 'e.current_salary',
      entranceDate: 'e.start_date',
      unmatchedField: 'e.unmatched_field',
      anotherUnmatchedField: 'another_unmatched_field'
    }})
    const data = {
      firstName: 'Fiona',
      lastName: 'Rabelais',
      position: 'Princess',
      ignoredData: 'ignored',
      salary: 100000,
      entranceDate: Date(),
    }
    let result = instance.buildParameterList (data, 'p.')
    expect (result).toEqual ([
      ['first_name', 'last_name', 'position'],
      [ data.firstName, data.lastName, data.position ]
    ])
    result = instance.buildParameterList (data, 'e.')
    expect (result).toEqual ([
      ['current_salary', 'start_date'],
      [ data.salary, data.entranceDate ]
    ])
  })
})
