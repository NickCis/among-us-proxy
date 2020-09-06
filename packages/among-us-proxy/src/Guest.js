const EventEmitter = require('events');
const WebSocketClient = require('websocket').client;
const Server = require('./Server');
const { WsProtocol } = require('./constants');

class Guest extends EventEmitter {
  constructor(host) {
    super();
    this.host = host;

    const client = (this.client = new WebSocketClient());

    client.on('connectFailed', error => {
      this.emit('error', error);
    });

    client.on('connect', conn => {
      this.emit('connect', { host, connection: conn });
      const server = (this.server = new Server());

      server.sendDiscovery();

      conn.on('message', msg => {
        this.emit('message', { message: msg, origin: 'socket' });
        if (msg.type === 'binary') server.send(msg.binaryData);
      });

      conn.on('close', () => {
        server.close();
        this.emit('error', new Error('Connection closed'));
      });

      server.on('message', msg => {
        this.emit('message', { message: msg, origin: 'game' });
        conn.sendBytes(msg);
      });
    });

    client.connect(host, WsProtocol);
  }

  close() {
    if (this.server) this.server.close();
    this.client.abort();
  }
}

module.exports = Guest;
