# Protocol explanation

## Service discovery

`0x0402{name}7e4f70656e7e{usersInGame}7e` -> `04 02 name~OPEN~1~` (uses `~` as separator)

## `01` messages

```
01 CC CC LL LL 05 20 00 00 00 NN NN 02 DD DD ...
                              |     QQ         |
                              \________________/
                                      |
                                  This can be repeated
```

 - `CC CC`: unsigned integer (16bits) used as a counter (big endian)
 - `LL LL`: Buffer length = LL LL + 6 (LL LL is in little endian)
 - `05`: unsigned integer (16bits) opt code
 - `20 00 00 00` -> That data
 - `NN NN`: Length without QQ (little endian)
 - `QQ`: code Usually `02` (player data) or `00 04` (player init)
 - `DD DD DD DD`: data. Usually first byte is the user id.


```
01 CC CC LL LL 06 20 00 00 00 PP NN NN 02 DD DD ...
                                 |     QQ         |
                                 \________________/
                                         |
                                  This can be repeated
```

 - `CC CC`: unsigned integer (16bits) used as a counter
 - `LL LL`: Buffer length = LL LL + 6 (LL LL is in little endian)
 - `06`: unsigned integer (16bits) opt code
 - `20 00 00 00` -> That data
 - `PP`: Some number related to the session
 - `NN NN`: Length without code (little endian)
 - `QQ`: code? Usually `00 02` or `00 04`
 - `DD DD DD DD`: data. Usually first byte is the user id.

## Handshake

## Multiplayer Hosts

 - `66.175.220.120`
 - `45.79.40.75`
 - `104.237.135.186`
 - `50.116.1.42`
 - `139.162.111.196`
 - `172.105.251.170`

