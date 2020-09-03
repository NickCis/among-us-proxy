const http = require('http');
const WebSocketServer = require('websocket').server;
const Client = require('./Client');
const { WsProtocol } = require('./constants');

const port = 8080;
const server = http.createServer((req, res) => {
  res.writeHead(404);
  res.end();
});

server.listen(port, () => {
  console.log('Listening to', port);
});

const wsServer =  new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

wsServer.on('request', req => {
  const conn = req.accept(WsProtocol, req.origin);
  const client = new Client();

  console.log('[', conn.remoteAddress, ']: Connected');

  conn.on('message', msg => {
    // console.log('[', conn.remoteAddress, ']: new message');
    switch (message.type) {
      case 'binary':
        client.send(msg.binaryData);
        break;

      default:
        break;
    }
  });

  conn.on('close', (code, desc) => {
    console.log('[', conn.remoteAddress, ']: close');
    client.close();
  });

  client.on('message', msg => {
    conn.sendBytes(msg);
  });
});
