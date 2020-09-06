import { ipcMain } from 'electron';
import { host, guest } from 'among-us-proxy';
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
  const state = (CurrentState = { code: 'host', state: 'localtunnel' });
  event.reply(GetAppState, CurrentState);

  const url = await ngrok.connect({
    addr: 8080,
    binPath: path => path.replace('app.asar', 'app.asar.unpacked'),
  });

  state.url = url;
  state.state = 'server';
  event.reply(GetAppState, CurrentState);

  const h = host(8080);

  instance = {
    close: () => {
      ngrok.kill();
      h.close();
    },
  };
});

ipcMain.on(RunGuest, async (event, host) => {
  close();
  console.log('host', host);
  const state = (CurrentState = { code: 'guest' });
  event.reply(GetAppState, CurrentState);
  const [, , protocol, domain] = host.trim().match(/^((.*?):\/\/)?(.*)$/);
  const url = `${
    protocol && protocol.match(/^wss?$/)
      ? protocol
      : protocol === 'https'
      ? 'wss'
      : 'ws'
  }://${domain}`;

  instance = guest(url);
});

ipcMain.on(Close, event => {
  close();
  CurrentState = { code: 'none' };
  event.reply(GetAppState, CurrentState);
});
