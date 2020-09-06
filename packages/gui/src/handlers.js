import { ipcMain } from 'electron';
import { Host, Guest } from 'among-us-proxy';
import fetch from 'node-fetch';
import ngrok from 'ngrok';
import { GetAppState, RunHost, RunGuest, Close } from './methods';

let CurrentState = { code: 'none' };

// https://www.electronjs.org/docs/api/ipc-main

let instance;

function close() {
  if (!instance) return;

  instance.close();
  instance = null;
}

ipcMain.on(GetAppState, event => {
  event.reply(GetAppState, CurrentState);
});

ipcMain.on(RunHost, async event => {
  close();
  const port = 8080;
  const state = (CurrentState = {
    code: 'host',
    state: [`Starting ngrok (${port})...`],
  });
  event.reply(GetAppState, CurrentState);

  const url = await ngrok.connect({
    addr: port,
    binPath: path => path.replace('app.asar', 'app.asar.unpacked'),
  });

  state.url = url.replace(/^http/, 'ws');
  state.state[0] = `${state.state[0]} ✅`;
  state.state[1] = `Exposed URL: ${state.url}`;
  state.state[2] = `Starting websocker server (${port})...`;
  event.reply(GetAppState, CurrentState);

  const host = new Host(port);

  host.on('listening', () => {
    state.state[2] = `${state.state[2]} ✅`;
    event.reply(GetAppState, CurrentState);
  });

  host.on('connection-open', ({ connection }) => {
    state.state.push(`New connection: ${connection.remoteAddress}`);
    event.reply(GetAppState, CurrentState);
  });

  host.on('connection-close', ({ connection }) => {
    state.state.push(`Closed connection: ${connection.remoteAddress}`);
    event.reply(GetAppState, CurrentState);
  });

  host.on('error', error => {
    state.error = error.toString();
    event.reply(GetAppState, CurrentState);
  });

  instance = {
    close: () => {
      ngrok.kill();
      host.close();
    },
  };
});

ipcMain.on(RunGuest, async (event, host) => {
  close();
  const [, , protocol, domain] = host.trim().match(/^((.*?):\/\/)?(.*)$/);
  const url = `${
    protocol && protocol.match(/^wss?$/)
      ? protocol
      : protocol === 'https'
      ? 'wss'
      : 'ws'
  }://${domain}`;

  const state = (CurrentState = {
    code: 'guest',
    state: [`Connection to: ${url}...`],
    // url,
  });
  event.reply(GetAppState, CurrentState);

  const guest = (instance = new Guest(url));

  guest.on('connect', () => {
    state.state[0] = `${state.state[0]} ✅`;
    event.reply(GetAppState, CurrentState);
  });

  guest.on('error', error => {
    state.error = error.toString();
    event.reply(GetAppState, CurrentState);
  });
});

ipcMain.on(Close, event => {
  close();
  CurrentState = { code: 'none' };
  event.reply(GetAppState, CurrentState);
});
