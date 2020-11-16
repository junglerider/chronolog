import * as Logger from 'bunyan'

interface RequestQuery {
  filter?: object
  order?: string
  limit?: string
  page?: string
  offset?: string
  combine?: string
}

/**
 * SqlGenerator provides a generate() method that creates SQL WHERE, ORDER, and LIMIT clauses from
 * a request query string. The input is a parsed query object supplied by express.
 */
export class SqlGenerator {

  private logger: Logger
  private schema: object = {}
  private operators = {
    eq: '=',
    neq: '<>',
    lt: '<',
    lte: '<=',
    gt: '>',
    gte: '>=',
    like: 'LIKE',
    in: 'IN',
    notin: 'NOT IN'
  }

  /**
   * SqlGenerator needs to map field names in the query string to  SQL column names and therefore
   * requires a schema map object.
   *
   * @param logger Bunyan logger
   * @param schema object schema map
   */
  constructor (logger: Logger, schema: object) {
    this.logger = logger
    this.schema = schema
  }

  /**
   * Parses query object to generate an SQL 'WHERE' clause, 'ORDER BY' clause and 'LIMIT' clause.
   *
   * @param query Express request query object
   * @return [ whereClause, parameterArray ]
   */
  public generate (query: RequestQuery): Array<string|Array<string>> {
    this.logger.trace (query, 'SqlGenerator parsing query...')
    this.validate (query)
    const [ whereClause, params ] = this.generateWhereClause (query)
    const orderClause = this.generateOrderClause (query)
    const limitAndOffset = this.generateLimitAndOffset (query)
    const sql = [ whereClause, orderClause, limitAndOffset ].filter (Boolean).join (' ')
    return [ sql, params ]
  }

  /**
   * Extracts name/value pairs from a data object according to the schema mapping.
   * If prefix is specified, only fields with matching prefixes are added and the
   * prefix is stripped from the field names.
   *
   * @param data Arbitrary object with data, e.g. parsed request body object
   * @param prefix Optional table prefix
   * @return [ namesArray, valuesArray ]
   */
  public buildParameterList (data: object, prefix: string = '') {
    const names: Array<string> = []
    const values: Array<string|number|boolean> = []
    Object.keys (this.schema).forEach ((key: string) => {
      if (data[key] !== undefined &&
        key !== 'id' &&
        (!prefix || this.schema[key].startsWith (prefix))
      ) {
        names.push (this.schema[key].slice (prefix.length))
        values.push (data[key])
      }
    })
    return [ names, values ]
  }

  /**
   * Validates request query object and throws error for unrecognized parameters.
   *
   * @param query Express request query object
   * @return true if all parameters are valid/recognized, false otherwise
   */
  private validate (query: RequestQuery): boolean {
    Object.keys (query).forEach ((key: string) => {
      if (!['filter', 'order', 'offset', 'page', 'limit', 'combine', 'format'].includes (key)) {
        throw new Error (`400:'${key}' is not a recognized query parameter.`)
      }
    })
    return true
  }

  /**
   * Parses query object to generate an SQL 'WHERE' clause.
   *
   * @param query Express request query object
   * @return [ whereClause, parameterArray ]
   */
  public generateWhereClause (query: RequestQuery): Array<string|Array<string>> {
    if (!query.filter)
      return ['', []]
    if (typeof query.filter !== 'object') {
      throw new Error ('400:Filter parameter is invalid. Object expected.')
    }
    const filter = this.normaliseFilter (query.filter)
    const [ terms, params ] = this.parseNormalisedFilter (filter)
    const booleanOperator = this.getBooleanOperator (query)
    const whereClause = (terms as string[]).join (booleanOperator)
    return [ (whereClause ? 'WHERE ' + whereClause : ''), params ]
  }

  /**
   * Parses query object to generate an SQL 'ORDER BY' clause.
   *
   * @param query Express request query object
   * @return the resulting 'ORDER BY' clause or empty string
   */
  public generateOrderClause (query: RequestQuery): string {
    if (!query.order) {
      return ''
    }
    if (typeof query.order !== 'string') {
      throw new Error ('400:Order parameter is invalid (string expected).')
    }
    let orderClause: string = ''
    const criteria: Array<string> = query.order.split (',').map ((column: string) => {
      const parts: Array<string> = column.split (':')
      const columnName: string = parts[0].toLowerCase ()
      const sortDirection: string = parts.length > 1 ? ' ' + parts[1].toUpperCase () : ''
      if (!(columnName in this.schema)) {
        throw new Error (`400:'${parts[0]}' is not a recognized field.`)
      }
      if (sortDirection === '' || sortDirection === ' DESC' || sortDirection === ' ASC') {
        return this.schema[columnName] + sortDirection
      } else {
        throw new Error (`400:'${parts[1]}' is not a recognized sort direction. Use ASC|DES.`)
      }
    }).filter ((orderByColumn: string) => {
      return Boolean (orderByColumn)
    })
    if (criteria.length) {
      orderClause = 'ORDER BY ' + criteria.join (', ')
    }
    return orderClause
  }

  /**
   * Parses query object to generate an SQL 'LIMIT' clause.
   *
   * @param query Express request query object
   * @return the resulting 'LIMIT' clause or empty string
   */
  public generateLimitAndOffset (query: RequestQuery): string {
    let clause = ''
    let limit = 0
    if (query.limit) {
      limit = parseInt (query.limit)
      if (isNaN (limit)) {
        throw new Error ('400:Limit value not a number.')
      }
    }
    let offset = 0
    if (query.offset) {
      offset = parseInt (query.offset)
    } else if (query.page) {
      offset = limit * parseInt (query.page)
    }
    if (isNaN (offset)) {
      offset = 0
      throw new Error ('400:Offset or page value not a number')
    }
    if (limit) {
      clause = `LIMIT ${limit}`
      if (offset) {
        clause += ` OFFSET ${offset}`
      }
    }
    return clause
  }

  /**
   * Normalises filter terms by removing invalid filter terms and unknown column names and by turning
   * string values resulting from the filter[column]=value syntax into objects equivalent to
   * filter[column][eq]=value.
   *
   * @param filter object containing filter terms
   */
  private normaliseFilter (filter: object): object {
    const normalisedTerms = {}
    Object.keys (filter).forEach ((key: string) => {
      const columnName: string = key.toLowerCase ()
      if (!(columnName in this.schema)) {
        throw new Error (`400:'${key}' is not a recognized field.`)
      }
      switch (typeof filter[columnName]) {
        case 'string':
          normalisedTerms[columnName] = { "eq": filter[columnName] }
        break
        case 'object':
          normalisedTerms[columnName] = filter[columnName]
        break
        default:
          throw new Error (`400:Filter parameter '${columnName}' is invalid.`)
      }
    })
    return normalisedTerms
  }

  /**
   * Parses a filter object and converts it into an array of SQL terms
   * (conditions) and an array of parameters.
   *
   * @param filter (normalised) object containing filter terms
   * @return [terms, parameterArray]
   */
  private parseNormalisedFilter (filter: object): Array<string|Array<string>> {
    const terms: Array<string> = [], params: Array<string> = []
    Object.keys (filter).forEach ((columnName: string) => {
      if (Array.isArray (filter[columnName])) {
        filter[columnName].forEach ((value: string) => {
          terms.push (`${this.schema[columnName]} = ?`)
          params.push (value)
        })
      } else {
        Object.keys (filter[columnName]).forEach ((comparisonOperator: string) => {
          if (!(comparisonOperator in this.operators)) {
            if (filter[columnName][comparisonOperator] === true) {
              terms.push (`${this.schema[columnName]} = ?`)
              params.push (comparisonOperator)
            } else {
              throw new Error (`400:Unknown comparison operator '${comparisonOperator}' for field '${columnName}'.`)
            }
          } else {
            const operator = this.operators[comparisonOperator]
            let value = filter[columnName][comparisonOperator]
            if (Array.isArray (value)) {
              value.forEach ((arrayValue: string) => {
                terms.push (`${this.schema[columnName]} ${operator} ?`)
                params.push (arrayValue)
              })
            } else {
              if (operator === 'IN' || operator === 'NOT IN') {
                value = value.split(',')
                value = '(' + value.map(v => "'" + v.replace(/\'/g,"''") + "'").join(',') + ')'
                terms.push (`${this.schema[columnName]} ${operator} ${value}`)
              } else if (value === 'NULL' && (operator === '=' || operator === '<>>')) {
                terms.push (`${this.schema[columnName]} IS ${operator === '='? 'NULL' : 'NOT NULL'}`)
              } else {
                terms.push (`${this.schema[columnName]} ${operator} ?`)
                params.push (value)
              }
            }
          }
        })
      }
    })
    return [ terms, params ]
  }

  /**
   * Parses query object to extract a boolean operator for combining
   * filter terms (default is AND).
   *
   * @param query Express request query object
   * @return ' AND ' | ' OR '
   */
  private getBooleanOperator (query: RequestQuery): string {
    let operator = 'AND'
    if (query.combine) {
      operator = query.combine.toUpperCase ()
      if (operator !== 'AND' && operator !== 'OR') {
        throw new Error (`400:'${query.combine}' is not a recognized boolean operand. Use AND|OR.`)
      }
    }
    return ' ' + operator + ' '
  }
}
