const EventEmitter = require('events');
const http = require('http');
const WebSocketServer = require('websocket').server;
const Client = require('./Client');
const { WsProtocol } = require('./constants');

class Host extends EventEmitter {
  constructor(port = 8080) {
    super();
    this.port = port;

    const server = (this.server = http.createServer((req, res) => {
      res.writeHead(404);
      res.end();
    }));

    server.listen(port, error => {
      if (error) {
        this.emit('error', error);
        return;
      }

      this.emit('listening', { port });
    });

    const wsServer = (this.ws = new WebSocketServer({
      httpServer: server,
      autoAcceptConnections: false,
    }));

    wsServer.on('request', req => {
      const conn = req.accept(WsProtocol, req.origin);
      const client = new Client();
      this.emit('connection-open', { request: req, connection: conn });

      conn.on('message', msg => {
        this.emit('message', {
          origin: 'socket',
          connection: conn,
          message: msg,
        });

        if (msg.type === 'binary') client.send(msg.binaryData);
      });

      conn.on('close', (code, desc) => {
        this.emit('connection-close', {
          connection: conn,
          code,
          description: desc,
        });
        client.close();
      });

      client.on('message', msg => {
        this.emit('message', {
          origin: 'game',
          connection: conn,
          message: msg,
        });
        conn.sendBytes(msg);
      });
    });
  }

  close() {}
}

module.exports = Host;
