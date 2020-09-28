const Host = require('./Host');
const Guest = require('./Guest');
const parse = require('./parse');
const print = require('./print');

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
      .option('protocol', {
        alias: 'p',
        describe: 'Procotol (ws or pj)',
        default: 'ws',
      })
      .option('port', {
        describe: 'Websocket listening port',
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
      const host = new Host(args.protocol, {
        ...(argv.port ? { port: argv.port } : undefined),
      });

      host.on('listening', id => {
        console.log('Listening to:', id);
      });

      host.on('error', error => {
        console.error(error.toString());
        process.exit(-1);
      });

      host.on('connection-open', connection => {
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
              console.log(
                '[',
                connection.remoteAddress,
                '] ->',
                msg.toString('hex')
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

      guest.on('connect', () => {
        console.log('connected');
      });

      guest.on('error', error => {
        console.error(error.toString());
        process.exit(-1);
      });

      if (argv.debug) {
        guest.on('message', ({ origin, message: msg }) => {
          const parsed = parse(msg);
          if (parsed && parsed.type === 'ping') return;
          switch (origin) {
            case 'game':
              print('<-', msg);
              break;

            case 'socket':
              print('->', msg);
              break;
          }
          if (parsed)
            console.log(
              parsed instanceof Error
                ? parsed.toString()
                : JSON.stringify(parsed)
            );
        });
      }
      break;
    }
  }
}

main(argv);
