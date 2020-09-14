const EventEmitter = require('events');
const WebSocket = require('ws');
const SimplePeerJs = require('simple-peerjs');
const wrtc = require('wrtc');
const fetch = require('node-fetch');

class Spj extends EventEmitter {
  constructor(peerId) {
    super();
    this.peerId = peerId;
  }

  async connect() {
    const id = this.peerId;
    const initiator = (this.initiator = new SimplePeerJs({
      fetch,
      WebSocket,
      wrtc,
    }));

    const conn = (this.conn = await initiator.connect(id));
    conn.peer.on('data', msg => this.emit('message', data));
    conn.peer.on('error', error => this.emit('error', error));
    conn.peer.on('close', () => this.emit('close'));
  }

  close() {
    this.initiator.close();
  }

  send(data) {
    this.conn.peer.send(data);
  }
}

module.exports = Spj;
