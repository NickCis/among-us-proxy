# Among Us Proxy

[See project page]('https://github.com/nickcis/among-us-proxy/README.md')

## How to use it

1. Download last release from [releases](https://github.com/NickCis/among-us-proxy/releases).
2. Unzip the file
3. Open `powershell` and go to the folder where the binary was uncompressed
4. If you are going to be:
  - Host:
    1. Create a match on the LAN section
    2. On the powershell run `among-us-proxy.exe host` (You can use the webRTC protocol with the flag `-p pj`)
    3. Guests should connect to `ws://<your ip>:8080` (You'll probably want to use [ngrok](https://ngrok.com/) or [localtunnel](https://localtunnel.me/) to expose the `8080` port to the world) or `pj://<peer id printed on the host>`  (You don't need to expose any port, it should work out of the box).
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

## Spying on the Multiplayer Protocol

This will explain how to listen to Among Us packets (without the use of network protocol analyzers such as [wireshark](https://www.wireshark.org/)).

This section suppose that:

- you will be running a guest on the computer that sniffs the traffic
- There is a Among Us local network multiplayer on your local network (you can run game host on any cellphone)
- You know the IP address of the Game Host

First use among us proxy cli to run a proxy. This proxy will just forward all packets to the among us host, it just will be used to log all the network traffic.

```
$ node src/main.js --debug guest among-us://<ip>

```

Now open the game and connect to the "Proxy" local multiplayer game. You'll see all the traffic printed on the console.

