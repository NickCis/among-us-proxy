const EventEmitter = require('events');
const server = require('./tunnel/server');
const Client = require('./among-us/Client');

class Host extends EventEmitter {
  constructor(protocol = 'ws', opts) {
    super();
    this.server = server(protocol, opts);
    this.server.on('listening', id => this.emit('listening', id));
    this.server.on('error', error => this.emit('error', error));
    this.server.on('connection', conn => {
      this.emit('connection-open', conn);
      conn.on('error', error =>
        this.emit('connection-error', { connection: conn, error })
      );

      const client = new Client();

      conn.on('message', msg => {
        this.emit('message', {
          origin: 'socket',
          connection: conn,
          message: msg,
          client,
        });

        client.send(msg);
      });

      conn.on('close', ({ code, reason }) => {
        this.emit('connection-close', {
          connection: conn,
          code,
          description: reason,
        });

        client.close();
      });

      client.on('message', msg => {
        this.emit('message', {
          origin: 'game',
          connection: conn,
          message: msg,
          client,
        });
        conn.send(msg);
      });
    });
  }

  close() {
    this.server.close();
  }
}

module.exports = Host;
