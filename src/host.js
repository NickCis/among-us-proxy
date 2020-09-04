const http = require('http');
const WebSocketServer = require('websocket').server;
const Client = require('./Client');
const { WsProtocol } = require('./constants');

function host(port = 8080) {
  const server = http.createServer((req, res) => {
    res.writeHead(404);
    res.end();
  });

  server.listen(port, () => {
    console.log('Listening to', port);
  });

  const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false,
  });

  wsServer.on('request', req => {
    const conn = req.accept(WsProtocol, req.origin);
    const client = new Client();

    console.log('[', conn.remoteAddress, ']: Connected');

    conn.on('message', msg => {
      switch (msg.type) {
        case 'binary':
          console.log(
            '[',
            conn.remoteAddress,
            '] ->',
            msg.binaryData.toString('hex')
          );
          client.send(msg.binaryData);
          break;

        default:
          console.log('[', conn.remoteAddress, '] ->', msg.utf8Data.toString());
          break;
      }
    });

    conn.on('close', (code, desc) => {
      console.log('[', conn.remoteAddress, ']: close');
      client.close();
    });

    client.on('message', msg => {
      console.log('[', conn.remoteAddress, '] <-', msg.toString('hex'));
      conn.sendBytes(msg);
    });
  });
}

module.exports = host;
