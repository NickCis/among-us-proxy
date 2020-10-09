const EventEmitter = require('events');
const Server = require('./among-us/Server');
const createClient = require('./tunnel/client');

class Guest extends EventEmitter {
  constructor(host) {
    super();
    this.host = host;
    this.ready = this.init();
    this.clients = {};
  }

  async createClient() {
    const client = createClient(this.host);

    client.on('error', e => this.emit('error', e));

    client.on('message', async (msg) => {
      this.emit('message', { message: msg, origin: 'socket' });
      this.server.send(msg);
    });

    client.on('close', () => {
      this.emit('error', new Error('Connection closed'));
    });

    try {
      await client.connect();
    } catch (e) {
      this.emit('error', e);
    }

    return client;
  }

  async getClient(rinfo) {
    const key = `${rinfo.address}:${rinfo.port}`;
    let client = this.clients[key];

    if (!client) {
      client = await (this.clients[key] = this.createClient());

      client.on('close', () => {
        delete this.clients[key];
      });
    }

    return client;
  }

  async init() {
    this.server = new Server();
    this.server.sendDiscovery();

    this.server.on('message', async (msg, rinfo) => {
      this.emit('message', { message: msg, origin: 'game', rinfo });
      const client = await this.getClient(rinfo);
      client.send(msg);
    });

    this.emit('connect', { host: this.host, connection: this.client });
  }

  close() {
    if (this.server) this.server.close();

    for (const [key, client] of Object.entries(this.clients)) {
      client.close();
      delete this.clients[key];
    }
  }
}

module.exports = Guest;
