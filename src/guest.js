const WebSocketClient = require('websocket').client;
const { WsProtocol } = require('./constants');
const Server = require('./Server');

const host = 'ws://localhost:8080';
const client = new WebSocketClient();

client.on('connectFailed', error => {
  console.log('Connect Error:', error.toString());
});

client.on('connect', conn => {
  console.log('Connected to', host);

  const server = new Server();
  server.sendDiscovery();

  conn.on('message', msg => {
    switch (message.type) {
      case 'binary':
        server.send(msg.binaryData);
        break;

      default:
        break;
    }
  });

  conn.on('close', () => {
    server.close();
  });

  server.on('message', msg => {
    conn.sendBytes(msg);
  });
});

client.connect(host, WsProtocol);
