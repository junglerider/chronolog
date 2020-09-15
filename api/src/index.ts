import server from './App'
import * as config from './config.json';

/**
 * Bootstrap the Chronolog API server.
 */

const port:number = config.port || 8080

server.app.listen (port, () => {

  server.log (`Chronolog API server is listening on port ${port}`)

  process.on ('SIGINT', () => {
    server.log(' SIGINT received...')
    process.exit (0);
  });

  process.on ('exit', () => {
    server.log ('Chronolog API server was terminated')
  });

})
