# Among Us Proxy

The idea of this is to create a proxy to play among us without the need of the multiplayer server. Among Us is a great game, but many times the multiplayer server are full creating long queues in order to play. This project tries to create a bridge over Websockets of the local LAN protocol.


## How does this work?

When a local match is created, the among us local Host broadcast a discovery message to the port `47777`.

Guests listen to this port in order to find matches on the local network. When a Guest connects to the Host, it sends udp packets to the port `22023` of the Host's ip.

Then the Host uses the ip and port of the received message in order to send messages to the Guest. All communication is done over udp.

This project aims to be a bridge (using WebSockets) of this udp communication.

On the Host side, it spints up a WebSocket server which Guests will connect to. When a Guest connects, the Host opens an udp port which will redirect all the WebSocket data through that udp port to the local `22023` udp port (which the games is listen to). Every message that is received on the opened udp port is forward to the Guest through the WebSocket.

On the Guest side, it connects through WebSocket to the Host server. In addition, it fakes the broadcast udp message discovery to make the game believe there is a match on the local network. Also, it listen on the local `22023` port to fake a Among Us server. Everything that is read through this port is forwarded through WebSocket to the Host. Everything that is received from the WebSocket is forwarded to the game through the udp port.

