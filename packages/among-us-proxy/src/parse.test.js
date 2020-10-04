const parse = require('./parse');

function message(str) {
  return parse(
    Buffer.from((str.join ? str.join('') : str).replace(/\s/g, ''), 'hex')
  );
}

describe('01', () => {
  /*
  it('', () => {
    const msg = message('01 00 02 05 00 01 20 00 00 00 07');
    // expect(msg).toEqual();
  });
  */

  describe('ack', () => {
    it('1 player', () => {
      const msg = message(
        '01 00 01 0e 00 07 20 00 00 00 03 00 00 00 02 00 00 00 01 02'
      );
      expect(msg).toEqual({
        type: 'ack',
        count: 1,
        number: 3,
        users: 1,
      });
    });

    it('2 players', () => {
      const msg = message(
        '01 00 01 0f 00 07 20 00 00 00 05 00 00 00 02 00 00 00 02 02 04'
      );
      expect(msg).toEqual({
        type: 'ack',
        count: 1,
        number: 5,
        users: 2,
      });
    });
  });

  describe('player', () => {
    it('2 players', () => {
      const msg = message([
        '01 00 02 83 00 06 20 00 00 00 05 0c 00 04 02 fe ff ff ff 0f 00 01 01 00 00',
        '01 2e 00 04 03 fe ff ff ff 0f 00 02 02 1d 00 01 02 00 07 61 6e 64 72 6f 69',
        '64 07 1c 00 00 00 00 01 05 66 61 6b 65 72 05 35 01 00 00 00 03 01 00 01 00',
        '1c 00 04 04 02 01 03 04 02 00 01 00 00 05 00 00 01 06 0a 00 01 05 00 fd 7a',
        '8f 87 ff 7f ff 7f 1c 00 04 04 04 01 03 0a 02 00 01 00 01 0b 00 00 01 0c 0a',
        '00 01 02 00 b8 7b f1 87 ff 7f ff 7f',
      ]);

      expect(msg).toEqual({
        type: 'player',
        msgs: [
          {
            type: 'user',
            name: 'android',
            color: 'white',
            hat: 28,
            pet: 0,
            skin: 0,
          },
          {
            type: 'user',
            name: 'faker',
            color: 'yellow',
            hat: 53,
            pet: 0,
            skin: 1,
          },
          { code: 2 },
          { code: 4 },
        ],
      });
    });
  });

  describe('player-look', () => {
    it('no user', () => {
      const msg = message([
        '01 00 04 27 00 05 20 00 00 00 0a 00 02 0d 06 07 66 61 6b 65 72 20 31 13 00',
        '02 02 1e 0e 00 02 07 66 61 6b 65 72 20 31 00 00 00 00 00 00',
      ]);

      expect(msg).toEqual({
        type: 'player-look',
        name: 'faker 1',
        color: 'red',
        hat: 0,
        pet: 0,
        skin: 0,
      });
    });

    it('user', () => {
      const msg = message([
        '01 00 05 20 00 05 20 00 00 00 03 00 02 0d 08 06 13 00 02 02 1e 0e 00 02 07',
        '66 61 6b 65 72 20 31 06 00 00 00 00 00',
      ]);

      expect(msg).toEqual({
        user: 13,
        type: 'player-look',
        name: 'faker 1',
        color: 'grey',
        hat: 0,
        pet: 0,
        skin: 0,
      });
    });
  });

  it('map settings', () => {
    const msg = message([
      '01 00 08 36 00 05 20 00 00 00 2f 00 02 04 02 2c 03 0a 02 00 00 00 01 00 00',
      '80 3f 00 00 80 3f 00 00 c0 3f 00 00 34 42 01 01 02 01 00 00 00 01 01 0f 00',
      '00 00 78 00 00 00 01 00 01 01',
    ]);

    expect(msg).toEqual({
      type: 'map-settings',
      map: 'MIRA HQ',
      playerSpeed: 1,
      crewmateVision: 1,
      impostorVision: 1.5,
      killCooldown: 45,
      commonTasks: 1,
      longTasks: 1,
      shortTasks: 2,
      emergencyMeetings: 1,
      impostors: 1,
      killDistance: 1,
      discussionTime: 15,
      votingTime: 120,
      emergencyCooldown: 0,
      confirm: 1,
      visualTasks: 1,
    });
  });
});
