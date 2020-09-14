const EventEmitter = require('events');
const Server = require('./among-us/Server');
const client = require('./tunnel/client');

class Guest extends EventEmitter {
  constructor(host) {
    super();
    this.host = host;

    this.client = client(host);
    this.ready = this.init();
  }

  async init() {
    try {
      await this.client.connect();
    } catch (e) {
      this.emit('error', e);
      return;
    }

    this.server = new Server();
    this.server.sendDiscovery();

    this.server.on('message', msg => {
      this.emit('message', { message: msg, origin: 'game' });
      this.client.send(msg);
    });

    this.client.on('error', e => this.emit('error', e));

    this.client.on('message', msg => {
      this.emit('message', { message: msg, origin: 'socket' });
      this.server.send(msg);
    });

    this.client.on('close', () => {
      this.server.close();
      this.emit('error', new Error('Connection closed'));
    });

    this.emit('connect', { host: this.host, connection: this.client });
  }

  close() {
    if (this.server) this.server.close();
    this.client.close();
  }
}

module.exports = Guest;
