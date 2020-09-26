const Host = require('./Host');
const Guest = require('./Guest');
const parse = require('./parse');

function printer({ length = 75, separator = '|' } = {}) {
  return (head, ...data) => {
    const maxLength = Math.max(...data.map(d => d.length));
    for (let i = 0; i < maxLength; i += length) {
      console.log(
        i ? ''.padEnd(head.length) : head,
        ...data.reduce((acc, element, ii) => {
          if (ii) acc.push('|');
          acc.push(element.substring(i, i + length).padEnd(length));
          return acc;
        }, [])
      );
    }
  };
}

function bufferToString(buffer) {
  let str = '';

  for (let i = 0; i < buffer.length; i++) {
    const value = buffer[i];
    str +=
      (value >= 0x20 && value <= 0x7e) || (value >= 0xa0 && value <= 0xff)
        ? String.fromCharCode(value)
        : '.';
  }

  return str;
}

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

const print = printer();

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
              print('<-', msg.toString('hex'), bufferToString(msg));
              break;

            case 'socket':
              print('->', msg.toString('hex'), bufferToString(msg));
              break;
          }
          if (parsed) console.log(JSON.stringify(parsed));
        });
      }
      break;
    }
  }
}

main(argv);
