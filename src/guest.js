const WebSocketClient = require('websocket').client;
const { WsProtocol } = require('./constants');
const Server = require('./Server');
const deferred = require('./deferred');

function guest(host = 'ws://localhost:8080', console = global.console) {
  const [promise, resolve] = deferred();
  const client = new WebSocketClient();

  client.on('connectFailed', error => {
    console.log('Connect Error:', error.toString());
    resolve(-1);
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

    conn.on('close', async () => {
      console.log('Closed connection');
      await server.close();
      resolve(-1);
    });

    server.on('message', msg => {
      console.log('<-', msg.toString('hex'));
      conn.sendBytes(msg);
    });
  });

  client.connect(host, WsProtocol);

  promise.close = async () => {
    await server.close();
    resolve(0);
  };

  return promise;
}

module.exports = guest;
