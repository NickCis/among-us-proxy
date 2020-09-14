const EventEmitter = require('events');
const WebSocket = require('ws');

class Connection extends EventEmitter {
  constructor(ws, req, server) {
    super();

    this.ws = ws;
    this.req = req;
    this.server = server;

    ws.on('message', msg => this.emit('message', msg));
    ws.on('close', (code, reason) => this.emit('close', { code, reason }));
    ws.on('error', error => this.emit('error', error));
  }

  get remoteAddress() {
    if (this.req.headers['x-forwarded-for'])
      return this.req.headers['x-forwarded-for'].split(/\s*,\s*/)[0];
    return this.req.socket.remoteAddress;
  }

  send(msg) {
    this.ws.send(msg);
  }

  close() {
    this.ws.close();
  }
}

class Ws extends EventEmitter {
  constructor(opts) {
    super();
    this.options = {
      port: 8080,
      ...opts,
    };

    const server = (this.server = new WebSocket.Server(this.options));

    server.on('error', error => this.emit('error', error));
    server.on('listening', () => this.emit('listening', this.options.port));
    server.on('close', () => this.emit('close'));
    server.on('connection', (ws, req) => {
      this.emit('connection', new Connection(ws, req, server));
    });
  }

  close() {
    this.server.close();
  }
}

module.exports = Ws;
