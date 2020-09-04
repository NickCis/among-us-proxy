# Among Us Proxy

The idea of this is to create a proxy to play among us without the need of the multiplayer server. Among Us is a great game, but many times the multiplayer server are full which creates long queues while trying to play. This project tries to build a bridge, using Web Sockets, in order to use the local LAN protocol.


## How does this work?

When a local match is created, the among us local Host broadcast a discovery message to the port `47777`.

Guests are listening to this port on the local network. When a Guest connects to the Host, it sends udp packets to the port `22023` of the Host's ip.

Then, the Host uses the ip and port of the received message in order to communicate with each Guest. All the communication is done over udp.

This project aims to be fill the gap (using WebSockets) of this udp communication over internet.

On the Host side, it spins up a WebSocket server which Guests will connect to. When a Guest has connected, the Host opens an udp port which will be used to redirect all the WebSocket data to the local `22023` udp port (this is the port the Game Host is listening). Every message that is received on the opened udp port is forwarded to the Guest through the WebSocket.

On the Guest side, it connects through WebSocket to the Host server. In addition, it fakes the broadcast udp message discovery to make the game believe that there is a match on the local network. In order to fake an Among Us server, it listens to the local `22023` port. Everything that is read through this port is forwarded (through WebSocket) to the Host. Everything that is received from the WebSocket is forwarded to the game through the udp port.

