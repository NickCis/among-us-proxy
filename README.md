# Among Us Proxy

The idea of this is to create a proxy to play among us without the need of the multiplayer server. Among Us is a great game, but many times the multiplayer server are full which creates long queues while trying to play. This project tries to build a bridge, using Web Sockets, in order to use the local LAN protocol.

## How does this work?

When a local match is created, the among us local Host broadcast a discovery message to the port `47777`.

Guests are listening to this port on the local network. When a Guest connects to the Host, it sends udp packets to the port `22023` of the Host's ip.

Then, the Host uses the ip and port of the received message in order to communicate with each Guest. All the communication is done over udp.

This project aims to be fill the gap (using WebSockets) of this udp communication over internet.

On the Host side, it spins up a WebSocket server which Guests will connect to. When a Guest has connected, the Host opens an udp port which will be used to redirect all the WebSocket data to the local `22023` udp port (this is the port the Game Host is listening). Every message that is received on the opened udp port is forwarded to the Guest through the WebSocket.

On the Guest side, it connects through WebSocket to the Host server. In addition, it fakes the broadcast udp message discovery to make the game believe that there is a match on the local network. In order to fake an Among Us server, it listens to the local `22023` port. Everything that is read through this port is forwarded (through WebSocket) to the Host. Everything that is received from the WebSocket is forwarded to the game through the udp port.

## How to use it

1. Download last release from [releases](https://github.com/NickCis/among-us-proxy/releases).
2. Unzip the file
3. Open `powershell` and go to the folder where the binary was uncompressed
4. If you are going to be:
  - Host:
    1. Create a match on the LAN section
    2. On the powershell run `among-us-proxy.exe host`
    3. Guests should connect to `ws://<your ip>:8080` (You'll probably want to use [ngrok](https://ngrok.com/) or [localtunnel](https://localtunnel.me/) to expose the `8080` port to the world.
  - Guest:
    1. On the powershell run `among-us-proxy-exe guest <host>`
    2. On the game, you'll find a _Proxy_ game on the Lan section, you should be able to connect to it.

## Use from source

```
$ npm install
$ node src/main.js --help
main.js <command>

Commands:
  main.js host [name]   Create a Host proxy
  main.js guest <host>  Create a Guest proxy

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

(And follow the _How to use it_ explanation)
