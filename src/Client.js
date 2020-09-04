const dgram = require('dgram');
const EventEmitter = require('events');
const { AmongUs } = require('./constants');

class Client extends EventEmitter {
  constructor(ip = '127.0.0.1') {
    super();

    this.ip = ip;

    const socket = dgram.createSocket('udp4');
    this.socket = new Promise(rs => {
      socket.bind(() => rs(socket));
    });

    socket.on('message', msg => this.emit('message', msg));
  }

  async send(msg) {
    const socket = await this.socket;
    return new Promise((rs, rj) => {
      socket.send(msg, AmongUs.serverPort, this.ip, err => {
        if (err) rj(err);
        else rs();
      });
    });
  }

  async close() {
    const socket = await this.socket;
    return new Promise((rs, rj) => {
      socket.close(err => {
        if (err) rj(err);
        else rs();
      });
    });
  }
}

module.exports = Client;
