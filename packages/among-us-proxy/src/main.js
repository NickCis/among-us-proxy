const host = require('./host');
const guest = require('./guest');

const argv = require('yargs')
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
  let code = 0;

  switch (cmd) {
    case 'host':
      code = await host(argv.port);
      break;

    case 'guest':
      code = await guest(argv.host);
      break;
  }

  process.exit(code);
}

main(argv);
