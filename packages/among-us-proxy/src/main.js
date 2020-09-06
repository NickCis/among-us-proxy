const Host = require('./Host');
const Guest = require('./Guest');

const argv = require('yargs')
  .option('debug', {
    alias: 'd',
    describe: 'Print debug messages',
  })
  .command('host [name]', 'Create a Host proxy', yargs => {
    yargs
      .positional('name', {
        describe: 'Match name',
      })
      .option('port', {
        alias: 'p',
        describe: 'Websocket listening port',
        default: 8080,
        number: true,
      });
  })
  .command('guest <host>', 'Create a Guest proxy', yargs => {
    yargs.positional('host', {
      describe: 'Host to connect',
    });
  })
  .help()
  .demandCommand(1, '').argv;

async function main(args) {
  const [cmd] = argv._;

  switch (cmd) {
    case 'host': {
      const host = new Host(argv.port);

      host.on('listening', ({ port }) => {
        console.log('Listening to port:', port);
      });

      host.on('error', error => {
        console.error(error.toString());
        process.exit(-1);
      });

      host.on('connection-open', ({ connection }) => {
        console.log('[', connection.remoteAddress, ']: Connected');
      });

      host.on('connection-close', ({ connection }) => {
        console.log('[', connection.remoteAddress, ']: close');
      });

      if (argv.debug) {
        host.on('message', ({ origin, message: msg, connection }) => {
          switch (origin) {
            case 'game':
              console.log(
                '[',
                connection.remoteAddress,
                '] <-',
                msg.toString('hex')
              );
              break;

            case 'socket':
              if (msg.type === 'binary')
                console.log(
                  '[',
                  connection.remoteAddress,
                  '] ->',
                  msg.binaryData.toString('hex')
                );
              else
                console.log(
                  '[',
                  connection.remoteAddress,
                  '] ->',
                  msg.utf8Data.toString()
                );
              break;
          }
        });
      }
      break;
    }

    case 'guest': {
      const guest = new Guest(argv.host);
      console.log('Connecting to:', argv.host);

      guest.on('connect', error => {
        console.log('connected');
      });

      guest.on('error', error => {
        console.error(error.toString());
        process.exit(-1);
      });

      if (argv.debug) {
        guest.on('message', ({ origin, message: msg }) => {
          switch (origin) {
            case 'game':
              console.log('<-', msg.toString('hex'));
              break;

            case 'socket':
              if (msg.type === 'binary')
                console.log('->', msg.binaryData.toString('hex'));
              else console.log('->', msg.utf8Data.toString());
              break;
          }
        });
      }
      break;
    }
  }
}

main(argv);
