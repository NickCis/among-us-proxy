const WebSocketClient = require('websocket').client;
const { WsProtocol } = require('./constants');
const Server = require('./Server');

function guest(host = 'ws://localhost:8080') {
  const client = new WebSocketClient();

  client.on('connectFailed', error => {
    console.log('Connect Error:', error.toString());
    process.exit(-1);
  });

  client.on('connect', conn => {
    console.log('Connected to', host);

    const server = new Server();
    server.sendDiscovery();

    conn.on('message', msg => {
      switch (msg.type) {
        case 'binary':
          console.log('->', msg.binaryData.toString('hex'));
          server.send(msg.binaryData);
          break;

        default:
          console.log('->', msg.utf8Data.toString());
          break;
      }
    });

    conn.on('close', () => {
      console.log('Closed connection');
      server.close();
      process.exit(-1);
    });

    server.on('message', msg => {
      console.log('<-', msg.toString('hex'));
      conn.sendBytes(msg);
    });
  });

  client.connect(host, WsProtocol);
}

module.exports = guest;
