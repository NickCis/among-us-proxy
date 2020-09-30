const Colors = {
  0: 'red',
  1: 'blue',
  2: 'green',
  3: 'pink',
  4: 'orange',
  5: 'yellow',
  6: 'grey',
  7: 'white',
  8: 'purple',
  9: 'brown',
  10: 'cyan',
  11: 'lime',
};

function getLengthedString(buffer, offset) {
  const length = buffer[offset];
  let text = '';

  for (let i = 0; i < length; i++) {
    text += String.fromCharCode(buffer[offset + 1 + i]);
  }

  return text;
}

function getLengthedBuffer(buffer, offset) {
  const length = buffer[offset];
  const head = buffer.readUInt16BE(offset + 1);
  const start = offset + 1 + 2;
  const end = start + length;

  return {
    length,
    head,
    start,
    end,
  };
}

function parse(buffer) {
  const code = buffer[0];

  switch (code) {
    case 0x00: {
      switch (buffer[1]) {
        case 0x12:
          // Movement
          break;
      }

      break;
    }

    case 0x01: {
      const count = buffer.readUInt16BE(1);
      // idk why 6
      const length = buffer[4] * 256 + buffer[3] + 6;
      if (buffer.length !== length)
        return new Error(
          `Invalid buffer. blength: ${buffer.length} length: ${length}`
        );

      const t = buffer[5];

      switch (t) {
        case 0x0005: {
          // XXX: Always? idk
          const pre = buffer.readUInt32BE(6);
          if (pre !== 0x20000000)
            return new Error(`unknown init: 0x${pre.toString(16)}`);

          let acc;

          for (let i = 10; i < buffer.length; ) {
            const read = getLengthedBuffer(buffer, i);

            if (read.head === 0x0002) {
              // const user = buffer[read.start];
              const opt = buffer[read.start + 1];
              switch (opt) {
                case 0x1e:
                  if (!acc) acc = {};

                  // Player info
                  acc.type = 'player-look';

                  const start = read.start + 5;
                  const name = (acc.name = getLengthedString(buffer, start));
                  acc.color = Colors[buffer[start + 1 + name.length]];
                  acc.hat = buffer[start + 1 + name.length + 1];
                  acc.pet = buffer[start + 1 + name.length + 2];
                  acc.skin = buffer[start + 1 + name.length + 3];

                  break;

                case 0x08:
                  // Player id
                  if (!acc) acc = {};
                  acc.user = buffer[read.start];
                  break;

                case 0x09:
                  // hat change
                  if (!acc) acc = {};
                  acc.type = 'hat-change';
                  acc.user = buffer[read.start];
                  acc.hat = buffer[read.start + 2];
                  break;

                case 0x0a:
                  // skin change
                  if (!acc) acc = {};
                  acc.type = 'skin-change';
                  acc.user = buffer[read.start];
                  acc.skin = buffer[read.start + 2];
                  break;

                case 0x0d:
                  // Player message
                  if (!acc) acc = {};
                  acc.user = buffer[read.start];
                  acc.message = getLengthedString(buffer, read.start + 2);
                  break;

                default:
                  console.error('Unknown opt:', opt.toString(16));
                  break;
              }
            } else if (read.head === 0x0004) {
              // TODO: parse more info
              return {
                type: 'player-init',
                user: buffer[read.start + 4],
              };
            } else {
              return new Error(`unknown head: 0x${read.head.toString(16)}`);
            }

            i = read.end;
          }

          return acc;
        }

        case 0x0006: {
          const pre = buffer.readUInt32BE(6);
          if (pre !== 0x20000000)
            return new Error(`unknown init: 0x${pre.toString(16)}`);

          const msgs = [];
          const number = buffer[10];

          for (let i = 11; i < buffer.length; ) {
            const read = getLengthedBuffer(buffer, i);
            if (read.head === 0x0002) {
              const data = {
                number,
                user: buffer[read.start],
              };
              const subsubcode = buffer[read.start + 1];

              switch (subsubcode) {
                case 0x05:
                  // name
                  data.type = 'player-name';
                  data.name = getLengthedString(buffer, read.start + 2);
                  break;

                case 0x07:
                  // color
                  data.type = 'player-color';
                  data.color = Colors[buffer[read.start + 2]];
                  break;

                default:
                  data.error = new Error(
                    `unknown subsubcode: ${subsubcode.toString(16)}`
                  );
                  break;
              }
              msgs.push(data);
            } else if (read.head === 0x0004) {
              const op = buffer[read.start];

              switch (op) {
                case 0x02:
                  // TODO:
                  break;
                case 0x03: {
                  // TODO: Player information
                  let index = read.start + 12;
                  const users = buffer[index++];
                  for (let i = 0; i < users; i++) {
                    const name = getLengthedString(buffer, index + 1);
                    index += 1 + 1 + name.length;
                    msgs.push({
                      type: 'user',
                      name,
                      color: Colors[buffer[index++]],
                      hat: buffer[index++],
                      skin: buffer[index++],
                      pet: buffer[index++],
                    });
                    index += 2;
                  }
                  break;
                }

                case 0x04:
                  msgs.push({ code: buffer[read.start + 1] });
                  break;

                default:
                  msgs.push(new Error(`unknown head: 0x${op.toString(16)}`));
                  break;
              }
            } else {
              // return new Error(`unknown head: 0x${read.head.toString(16)}`);
              msgs.push(new Error(`unknown head: 0x${read.head.toString(16)}`));
            }
            i = read.end;
          }

          return {
            type: 'player',
            msgs,
          };

          const subcode = buffer[10];

          if (subcode === 0x0e) {
            // Change player color
            const user = buffer[14];
            const color = Colors[buffer[16]];

            return {
              type: 'player-color',
              color,
              user,
            };
          } else if (subcode === 0x1b) {
            // player init
            const read = getLengthedBuffer(buffer, 11);
            if (read.head !== 0x0002)
              return new Error(`unknown head: 0x${read.head.toString(16)}`);

            const data = {
              user: buffer[read.start],
            };
            const subsubcode = buffer[read.start + 1];

            switch (subsubcode) {
              case 0x05:
                // name
                data.type = 'player-name';
                data.name = getLengthedString(buffer, read.start + 2);
                break;

              case 0x07:
                // color
                data.type = 'player-color';
                data.color = Colors[buffer[read.start + 2]];
                break;

              default:
                return new Error(
                  `unknown subsubcode: ${subsubcode.toString(16)}`
                );
            }

            return data;
          }

          return new Error(`unknown t = 0x0006 message subcode = ${subcode}`);
        }

        case 0x0007: {
          const pre = buffer.readUInt32BE(6);
          if (pre !== 0x20000000)
            return new Error(`unknown init: 0x${pre.toString(16)}`);

          // ack
          return {
            type: 'ack',
            count,
            number: buffer[10],
            users: buffer[18],
          };
        }

        case 0x0001:
        default:
          return new Error(`implement t: ${t}`);
      }

      break;
    }

    case 0x04:
      // Broadcast message
      // String.fromCharCode(0x7e) = '~'
      // 0402<name>~Open~xx~
      break;

    case 0x08: {
      // Handshake
      // 08 00 01 00 1a d1 02 03
      // 08 00 01 00 46 d2 02 03 06
      // 08 00 01 00 46 d2 02 03 06 4e 4f 4d 42 52 45
      //                            N  O  M  B  R  E
      const count = buffer.readUInt16BE(1);
      const name = getLengthedString(buffer, 8);
      return {
        type: 'handshake',
        name,
        count,
      };
    }

    case 0x09:
      return { type: 'close' };

    case 0x0a:
    case 0x0c: {
      // Ping: 0axxxxff
      const count = buffer.readUInt16BE(1);
      return {
        type: 'ping',
        count,
      };
    }
  }

  return undefined;
}

parse.Colors = Colors;

module.exports = parse;
