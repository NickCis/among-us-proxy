# Protocol explanation

## Service discovery

`0x0402{name}7e4f70656e7e{usersInGame}7e` -> `04 02 name~OPEN~1~` (uses `~` as separator)


## `01` messages

```
01 CC CC LL EE 05 20 00 00 00 NN 00 02 DD DD ...
                              \________________/
                                      |
                                  This can be repeated
```

 - `CC CC`: unsigned integer (16bits) used as a counter
 - `LL`:
 - `EE`: Buffer length = EE * 256 + LL + 6
 - `05`: unsigned integer (16bits) opt code
 - `20 00 00 00` -> That data
 - `NN`: Length without head
 - `HH HH`: head? Usually `00 02` (player data) or `00 04` (player init)
 - `DD DD DD DD`: data. Usually first byte is the user id.


```
01 CC CC LL EE 06 20 00 00 00 PP NN 00 02 DD DD ...
                                 \________________/
                                         |
                                  This can be repeated
```

 - `CC CC`: unsigned integer (16bits) used as a counter
 - `LL`:
 - `EE`: Buffer length = EE * 256 + LL + 6
 - `06`: unsigned integer (16bits) opt code
 - `20 00 00 00` -> That data
 - `PP`: Some number related to the session
 - `NN`: Length without head
 - `HH HH`: head? Usually `00 02` or `00 04`
 - `DD DD DD DD`: data. Usually first byte is the user id.

## Handshake

## Multiplayer Hosts

 - `66.175.220.120`
 - `45.79.40.75`
 - `104.237.135.186`
 - `50.116.1.42`
 - `139.162.111.196`
 - `172.105.251.170`

