describe ('API entry point', () => {
  let handlers: Record<string, Function>

  beforeEach (() => {
    handlers = {}
  })

  afterEach (() => {
    jest.restoreAllMocks ()
    jest.resetModules ()
    jest.dontMock ('../src/App')
    jest.dontMock ('../src/config.json')
  })

  test.each ([
    [0, 8080],
    [8889, 8889]
  ]) ('starts the server without password bootstrap on the configured/fallback port', (configuredPort, expectedPort) => {
    const fakeServer = {
      app: {
        listen: jest.fn ((_port: number, callback: () => void) => callback ())
      },
      log: jest.fn ()
    }
    jest.doMock ('../src/App', () => ({
      __esModule: true,
      default: fakeServer,
      logger: { error: jest.fn () }
    }))
    jest.doMock ('../src/config.json', () => ({ port: configuredPort }))
    jest.spyOn (process, 'on').mockImplementation (((event: string, listener: Function) => {
      handlers[event] = listener
      return process
    }) as any)
    const exit = jest.spyOn (process, 'exit').mockImplementation (() => undefined as never)
    jest.isolateModules (() => require ('../src/index'))

    expect (fakeServer.app.listen).toHaveBeenCalledWith (expectedPort, expect.any (Function))
    expect (fakeServer.log).toHaveBeenCalledWith (`Chronolog API server is listening on port ${expectedPort}`)
    expect (handlers.SIGINT).toEqual (expect.any (Function))
    expect (handlers.exit).toEqual (expect.any (Function))

    handlers.SIGINT ()
    expect (exit).toHaveBeenCalledWith (0)
    handlers.exit ()
    expect (fakeServer.log).toHaveBeenCalledWith ('Chronolog API server was terminated')
  })
})
