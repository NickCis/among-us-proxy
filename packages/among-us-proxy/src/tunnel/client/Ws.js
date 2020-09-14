const EventEmitter = require('events');
const WebSocket = require('ws');
const { WsProtocol } = require('../../constants');

class Ws extends EventEmitter {
  constructor(host) {
    super();
    this.host = host;
  }

  connect() {
    const host = this.host;

    return new Promise((rs, rj) => {
      let connected = false;
      const ws = (this.ws = new WebSocket(host, WsProtocol));

      ws.once('open', () => {
        connected = true;
        ws.on('message', ev => {
          this.emit('message', ev.data);
        });
      });

      ws.once('error', error => {
        if (!connected) rj(error);

        this.emit('error', error);
      });

      ws.on('close', () => this.emit('close'));
    });
  }

  close() {
    this.ws.close();
  }

  send(data) {
    this.ws.send(data);
  }
}

module.exports = Ws;
