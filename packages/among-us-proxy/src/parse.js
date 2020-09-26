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
  11: 'light-green',
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
      const length = buffer[3];
      // idk why 6
      if (buffer.length - 6 - length !== 0)
        return new Error(
          `Invalid buffer. blength: ${buffer.length} length: ${length}`
        );

      const t = buffer.readUInt16BE(4);

      switch (t) {
        case 0x0005: {
          // XXX: Always? idk
          const pre = buffer.readUInt32BE(6);
          if (pre !== 0x20000000)
            return new Error(`unknown init: 0x${pre.toString(16)}`);

          let acc;

          for (let i = 10; i < buffer.length; ) {
            const read = getLengthedBuffer(buffer, i);

            if (read.head !== 0x0002)
              return new Error(`unknown head: 0x${read.head.toString(16)}`);

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
                acc.skin = buffer[read.start + 2];
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

            i = read.end;
          }

          return acc;
        }

        case 0x0006: {
          if (buffer[6] !== 0x20) break;
          const subcode = buffer.readUInt32BE(7);

          if (subcode !== 0x0e) break;

          // Change player color
          const user = buffer[14];
          const color = Colors[buffer[16]];

          return {
            type: 'player-color',
            color,
            user,
          };
        }

        case 0x0001:
        case 0x0007:
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

module.exports = parse;
