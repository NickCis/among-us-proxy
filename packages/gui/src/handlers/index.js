import { ipcMain } from 'electron';
import { Host, Guest, Discovery } from 'among-us-proxy';
import fetch from 'node-fetch';
import ngrok from 'ngrok';
import {
  GetAppState,
  RunHost,
  RunGuest,
  Close,
  RemoveGuest,
  RunDiscovery,
  StopDiscovery,
  DiscoveredHost,
} from '../methods';
import ConnectionJar from './ConnectionJar';

let CurrentState = { code: 'none' };
let Connections;

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

ipcMain.on(RunHost, async (event, config = {}) => {
  close();
  Connections = new ConnectionJar();

  if (!config.protocol) config.protocol = 'ws';

  if (!('ngrok' in config)) config.ngrok = true;

  if (config.protocol !== 'ws') config.ngrok = false;

  if (!('local' in config)) config.local = true;

  if (config.local) config.host = '127.0.0.1';

  const port = 8080;
  const state = (CurrentState = {
    code: 'host',
    state: config.ngrok ? [`Starting ngrok (${port})...`] : [],
    connections: [],
  });
  event.reply(GetAppState, CurrentState);

  if (config.protocol === 'ws') state.url = `ws://<this ip>:${port}`;

  if (config.ngrok) {
    const url = await ngrok.connect({
      addr: port,
      binPath: path => path.replace('app.asar', 'app.asar.unpacked'),
    });

    state.url = url.replace(/^http/, 'ws');
    state.state[0] = `${state.state[0]} ✅`;
    state.state.push(`Exposed URL: ${state.url}`);
  }

  state.state.push(`Starting server (${port})...`);
  event.reply(GetAppState, CurrentState);

  const host = new Host(config.protocol, { port, ip: config.host });

  host.on('listening', id => {
    if (id && config.protocol === 'pj') state.url = `pj://${id}`;

    state.state[state.state.length - 1] = `${state.state[2]} ✅`;
    event.reply(GetAppState, CurrentState);
  });

  host.on('connection-open', connection => {
    const key = Connections.add(connection);
    state.state.push(`New connection: ${connection.remoteAddress}`);
    state.connections = state.connections.filter(c => c.key !== key);
    state.connections.push({ remoteAddress: connection.remoteAddress, key });
    event.reply(GetAppState, CurrentState);
  });

  host.on('connection-close', ({ connection }) => {
    const key = Connections.delete(connection);
    state.state.push(`Closed connection: ${connection.remoteAddress}`);
    state.connections = state.connections.filter(c => c.key !== key);
    event.reply(GetAppState, CurrentState);
  });

  host.on('error', error => {
    state.error = error.toString();
    event.reply(GetAppState, CurrentState);
  });

  instance = {
    close: () => {
      if (config.ngrok) ngrok.kill();
      host.close();
    },
  };
});

ipcMain.on(RemoveGuest, (event, key) => {
  const connection = Connections.get(key);
  connection.close();
  Connections.delete(connection);
  CurrentState.state.push(`Removed: ${connection.remoteAddress}`);
  CurrentState.connections = CurrentState.connections.filter(
    c => c.key !== key
  );
  event.reply(GetAppState, CurrentState);
});

ipcMain.on(RunGuest, async (event, host) => {
  close();
  const [, , protocol, domain] = host.trim().match(/^((.*?):\/\/)?(.*)$/);
  const proto = protocol ? protocol.toLowerCase() : '';
  const url = `${
    proto.match(/^wss?$/)
      ? proto
      : proto === 'pj'
      ? proto
      : proto === 'https'
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

ipcMain.on(RunDiscovery, event => {
  close();
  const discovery = (instance = new Discovery());

  discovery.on('message', host => {
    event.reply(DiscoveredHost, host);
  });

  discovery.listen();
});

ipcMain.on(StopDiscovery, () => {
  if (instance instanceof Discovery) close();
});

ipcMain.on(Close, event => {
  close();
  CurrentState = { code: 'none' };
  event.reply(GetAppState, CurrentState);
});
