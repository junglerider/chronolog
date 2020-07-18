import * as Logger from 'bunyan'

export function createMockLogger () {

  const logger = Logger.createLogger ({
    name: 'mockLogger',
    level: 'trace'
  });

  logger.fatal = jest.fn()
  logger.error = jest.fn()
  logger.warn = jest.fn()
  logger.info = jest.fn()
  logger.debug = jest.fn()
  logger.trace  = jest.fn()

  return logger;
}
