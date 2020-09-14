const WebSocket = require('./Ws');
const SimplePeerJs = require('./Spj');

function server(protocol, opts) {
  switch (protocol) {
    case 'ws':
    case 'wss':
    case 'http':
    case 'https':
      return new WebSocket(opts);

    case 'pj':
      return new SimplePeerJs(opts);

    default:
      throw new Error(`Unknown protocol: '${protocol}'`);
  }
}

module.exports = server;
