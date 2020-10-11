import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import GamesIcon from '@material-ui/icons/Games';

import { RunDiscovery, DiscoveredHost, StopDiscovery } from '../methods';

const useStyles = makeStyles(theme => ({
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

function HostSetupDialog({ onSubmit, onClose, open }) {
  const classes = useStyles();
  const [protocol, setProtocol] = useState('ws');
  const [ngrok, setNgrok] = useState(true);
  const [local, setLocal] = useState(true);
  const [hosts, setHosts] = useState([]);
  const [host, setHost] = useState();

  useEffect(() => {
    if (!open && !local) setLocal(true);
  }, [open]);

  useEffect(() => {
    if (local) return;

    const handler = (event, host) => {
      setHosts(hosts => {
        if (hosts.some(h => h.ip === host.ip)) return hosts;

        return [host, ...hosts];
      });
    };

    ipcRenderer.send(RunDiscovery);
    ipcRenderer.on(DiscoveredHost, handler);

    return () => {
      ipcRenderer.send(StopDiscovery);
      ipcRenderer.removeListener(DiscoveredHost, handler);
    };
  }, [local]);

  const valid = local || (!local && host);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
      fullWidth
    >
      <form
        onSubmit={ev => {
          ev.preventDefault();
          onSubmit({
            protocol,
            ngrok,
            local,
            host,
          });
        }}
      >
        <DialogTitle id="form-dialog-title">Host Configuration</DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemText primary="Protocol" />
              <ListItemSecondaryAction>
                <Select
                  value={protocol}
                  onChange={event => setProtocol(event.target.value)}
                >
                  <MenuItem value="ws">Websocket</MenuItem>
                  <MenuItem value="pj">PeerJs</MenuItem>
                </Select>
              </ListItemSecondaryAction>
            </ListItem>
            {protocol === 'ws' && (
              <ListItem>
                <ListItemText primary="Ngrok" />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    onChange={() => setNgrok(ngrok => !ngrok)}
                    checked={ngrok}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            )}
            <ListItem>
              <ListItemText primary="Localhost" />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  onChange={() => setLocal(local => !local)}
                  checked={local}
                />
              </ListItemSecondaryAction>
            </ListItem>
            {!local && (
              <List component="div" disablePadding>
                {hosts.length ? (
                  hosts.map(h => (
                    <ListItem
                      button
                      key={h.ip}
                      selected={host === h.ip}
                      className={classes.nested}
                      onClick={() => setHost(h.ip)}
                    >
                      <ListItemIcon>
                        <GamesIcon />
                      </ListItemIcon>
                      <ListItemText primary={`${h.name} - ${h.ip}`} />
                    </ListItem>
                  ))
                ) : (
                  <ListItem className={classes.nested}>
                    <ListItemText primary="Loading..." />
                  </ListItem>
                )}
              </List>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary" disabled={!valid}>
            Connect
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default HostSetupDialog;
