# Among Us Proxy

[See project page]('https://github.com/nickcis/among-us-proxy/README.md')

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
