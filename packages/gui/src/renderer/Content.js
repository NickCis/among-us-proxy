import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import useAppState from './useAppState';
import { RunHost, RunGuest, Close } from '../methods';
import HostDialog from './HostDialog';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1, 0),
  },
}));

function Content() {
  const appState = useAppState();
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  switch (appState.code) {
    case 'none':
      return (
        <>
          <HostDialog
            open={open}
            onSubmit={host => {
              ipcRenderer.send(RunGuest, host);
              setOpen(false);
            }}
            onClose={() => setOpen(false)}
          />
          <Button
            fullWidth
            color="primary"
            variant="contained"
            className={classes.button}
            onClick={() => ipcRenderer.send(RunHost)}
          >
            Host
          </Button>
          <Button
            fullWidth
            color="primary"
            variant="contained"
            className={classes.button}
            onClick={() => setOpen(true)}
          >
            Guest
          </Button>
        </>
      );

    default:
      return (
        <>
          <Button
            fullWidth
            color="primary"
            variant="contained"
            className={classes.button}
            onClick={() => ipcRenderer.send(Close)}
          >
            Back
          </Button>
          <pre>
            <code>{JSON.stringify(appState, null, 2)}</code>
          </pre>
        </>
      );
  }
}

export default Content;
