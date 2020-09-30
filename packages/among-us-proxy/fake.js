// Fake client implementation
// node ./fake.js <host ip>

const Client = require('./src/among-us/Client');
const parse = require('./src/parse');
const print = require('./src/print');

function sleep(ms) {
  return new Promise(rs => {
    setTimeout(rs, ms);
  });
}

const name = 'faker';

const promises = {};
function waitMessage(type) {
  return new Promise(rs => {
    promises[type] = rs;
  });
}

async function main() {
  const ip = process.argv[2];
  if (!ip) return;
  console.log('Ip:', ip);

  const client = new Client(ip);

  await client.socket;

  function send(msg) {
    print('<-', msg);

    return client.send(msg);
  }

  client.on('message', async (msg) => {
    const parsed = parse(msg);

    if (parsed && parsed.type === 'ping') {
      client.send(msg);
      return;
    }

    print('->', msg);

    if (!parsed) return;

    console.log(
      parsed instanceof Error
      ? parsed.toString()
      : JSON.stringify(parsed)
    );

    if (parsed.type in promises) {
      promises[parsed.type]({ msg, parsed });
      delete promises[parsed.type];
    }
  });

  // Handshake
  await send(Buffer.from([
    0x08,
    0x00,
    0x01,
    0x00,
    0x46,
    0xd2,
    0x02,
    0x03,
    name.length, // length
    ...[...name].map(c => c.charCodeAt(0)),
  ]));

  await sleep(100);

  await send(Buffer.from([
    0x01, // 01
    0x00, // Counter
    0x02, //
    0x05, // length
    0x00,
    0x01,
    0x20,
    0x00,
    0x00,
    0x00,
    0x07,
  ]));

  const ack = await waitMessage('ack');

  await send(Buffer.from([
    0x01,
    0x00,
    0x03,
    0x13, // 0x14, // lenght
    0x00,
    0x05,
    0x20,
    0x00,
    0x00,
    0x00,
    0x0c,
    0x00,
    0x06,
    ack.parsed.number, // 0x32,
    // 0x01, // Sometimes this byte isnt present, so the length has to be decreased
    0x0a, // 'OnlineGame'.length
    0x4f, // 0
    0x6e, // n
    0x6c, // l
    0x69, // i
    0x6e, // n
    0x65, // e
    0x47, // G
    0x61, // a
    0x6d, // m
    0x65, // e
  ]));

  const [init, player] = await Promise.all([waitMessage('player-init'), waitMessage('player')]);
  const playerCode = player.parsed.msgs.filter(m => 'code' in m)[0].code;

  await send(Buffer.from([
    0x01,
    0x00,
    0x04,
    11 + name.length, // msg length
    0x00,
    0x06,
    0x20,
    0x00,
    0x00,
    0x00,
    playerCode, // code
    1 + 1 + name.length, // length not counting 0x00 02
    0x00,
    0x02,
    init.parsed.user, // player id
    0x05,
    name.length, // length
    ...[...name].map(c => c.charCodeAt(0)),
  ]));

  await sleep(100);

  await send(Buffer.from([
    0x01,
    0x00,
    0x05,
    0x0b, // msg length
    0x00,
    0x06,
    0x20,
    0x00,
    0x00,
    0x00,
    playerCode, // code
    0x03, // length not counting 0x00 02
    0x00,
    0x02,
    init.parsed.user, // player id
    0x07,
    0x05, // color
  ]));

  // --- Handshake finished ----

  await sleep(100);

  // skin-change
  console.log('changing skin');

  await send(Buffer.from([
    0x01,
    0x00,
    0x06,
    0x16, // msg length
    0x00,
    0x05,
    0x20,
    0x00,
    0x00,
    0x00,
    0x03, // length not counting 0x00 02
    0x00,
    0x02,
    init.parsed.user, // player id
    0x11,
    0x01, // pet
    0x03, // length not counting 0x00 02
    0x00,
    0x02,
    init.parsed.user,
    0x09,
    0x35, // hat
    0x03, // length
    0x00,
    0x02,
    init.parsed.user,
    0x0a,
    0x00, // skin
  ]));
}

main();
