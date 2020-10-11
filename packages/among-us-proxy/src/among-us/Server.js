const dgram = require('dgram');
const EventEmitter = require('events');
const { AmongUs } = require('../constants');
const { stringToHex } = require('../utils');

class Server extends EventEmitter {
  constructor(name = 'Proxy', ip = '255.255.255.255', usersInGame = 1) {
    super();
    this.name = name;
    this.ip = ip;
    this.usersInGame = usersInGame;

    const socket = dgram.createSocket('udp4');

    this.socket = new Promise(rs => {
      socket.bind(AmongUs.serverPort, () => {
        rs(socket);
        socket.on('message', (msg, rinfo) => {
          this.rinfo = rinfo;
          this.emit('message', msg, rinfo);
        });
      });
    });
  }

  sendDiscovery() {
    const discovery = (this.discovery = dgram.createSocket('udp4'));
    // numberToHex(4) + numberToHex(2) + stringToHex(name) + stringToHex(`~Open~${users}~`)
    const message = Buffer.from(
      `0402${stringToHex(this.name)}7e4f70656e7e${stringToHex(
        `${this.usersInGame}`
      )}7e`,
      'hex'
    );

    discovery.bind(() => {
      discovery.setBroadcast(true);
      this.discoveryInterval = setInterval(() => {
        discovery.send(message, AmongUs.broadcastPort, this.ip);
      }, 500);
    });
  }

  async send(msg) {
    const socket = await this.socket;
    return new Promise((rs, rj) => {
      socket.send(msg, this.rinfo.port, this.rinfo.address, err => {
        if (err) rj(err);
        else rs();
      });
    });
  }

  async close() {
    clearInterval(this.discoveryInterval);
    this.discovery.close();

    const socket = await this.socket;
    return new Promise((rs, rj) => {
      socket.close(err => {
        if (err) rj(err);
        else rs();
      });
    });
  }
}

module.exports = Server;
