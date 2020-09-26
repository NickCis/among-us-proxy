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
  11: 'ligh-green',
};

function getLengthedString(buffer, offset) {
  const length = buffer[offset];
  let text = '';

  for (let i = 0; i < length; i++) {
    text += String.fromCharCode(buffer[offset + 1 + i]);
  }

  return text;
}

function parse(buffer) {
  const code = buffer[0];

  switch (code) {
    case 0x01: {
      const count = buffer.readUInt16BE(1);
      const length = buffer[3];
      // idk why 6
      if (buffer.length - 6 - length !== 0)
        return new Error(`Invalid buffer. blength: ${buffer.length} length: ${length}`);

      // 0x00 05
      if (buffer.readUInt16BE(4) !== 0x0005) break;

      // 0x20 00
      if (buffer.readUInt16BE(6) !== 0x2000) break;

      const subcode = buffer[10];
      const user = buffer[13];

      if (subcode === 0x03) {
        // User Update
        const name = getLengthedString(buffer, 24);
        const color = Colors[buffer[29]];
        const hat = buffer[30];
        const pet = buffer[31];
        const skin = buffer[32];

        return {
          type: 'player-look',
          name,
          count,
          color,
          hat,
          pet,
          skin,
        };
      } else if (subcode === 0x04) {
        // Reply to user update
      } else if (subcode >= 0x05) {
        // message
      }
    }

    case 0x00: {
      switch (buffer[1]) {
        case 0x12:
          // Movement
          break;
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

    case 0x0a:
    case 0x0c: {
      // Ping: 0axxxxff
      const count = buffer.readUInt16BE(1);
      return {
        type: 'ping',
        count,
      };
    }

    case 0x09:
      return { type: 'close' };
  }

  return undefined;
}

module.exports = parse;
