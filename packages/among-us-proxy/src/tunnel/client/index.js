const WebSocket = require('./Ws');
const SimplePeerJs = require('./Spj');
const AmongUs = require('./AmongUs');

function client(host, opts) {
  const url = new URL(host);

  switch (url.protocol) {
    case 'ws:':
    case 'wss:':
    case 'http:':
    case 'https:':
      return new WebSocket(host, opts);

    case 'pj:':
      return new SimplePeerJs(url.host, { ...opts, host });

    case 'among-us:':
      return new AmongUs(url.host, opts);

    default:
      throw new Error(`Unknown protocol: '${url.protocol}'`);
  }
}

module.exports = client;
