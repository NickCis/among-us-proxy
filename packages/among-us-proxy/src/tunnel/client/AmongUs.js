const EventEmitter = require('events');
const AmongUsClient = require('../../among-us/Client');

class AmongUs extends EventEmitter {
  constructor(ip) {
    super();
    this.ip = ip;
  }

  connect() {
    this.amongUs = new AmongUsClient(this.ip);
    this.amongUs.on('message', msg => this.emit('message', msg));
    this.amongUs.on('error', error => this.emit('error', error));
    this.amongUs.on('close', () => this.emit('close'));

    return this.amongUs.socket;
  }

  close() {
    return this.amongUs.close();
  }

  send(data) {
    return this.amongUs.send(data);
  }
}

module.exports = AmongUs;
