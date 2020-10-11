const EventEmitter = require('events');
const WebSocket = require('ws');
const SimplePeerJs = require('simple-peerjs');
const wrtc = require('wrtc');
const fetch = require('node-fetch').default;

class Connection extends EventEmitter {
  constructor(conn, server) {
    super();

    this.conn = conn;
    this.server = server;

    conn.peer.on('data', msg => this.emit('message', msg));
    conn.peer.on('close', () =>
      this.emit('close', { code: 0, reason: 'Closed connection' })
    );
    conn.peer.on('error', error => this.emit('error', error));
  }

  get remoteAddress() {
    return this.conn.peerId;
  }

  send(msg) {
    this.conn.peer.send(msg);
  }

  close() {
    this.conn.peer.destroy();
  }
}

class Spj extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.options = {
      fetch,
      WebSocket,
      wrtc,
      ...opts.simplePeerJs,
    };

    const server = (this.server = new SimplePeerJs(this.options));

    server.on('error', error => this.emit('error', error));
    server.id.then(id => this.emit('listening', id));
    server.on('close', () => this.emit('close'));
    server.on('connect', conn => {
      this.emit('connection', new Connection(conn, server));
    });
  }

  close() {
    this.server.close();
  }
}

module.exports = Spj;
