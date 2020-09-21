import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Frame from './Frame';
import Alerts from './Alerts';
import { Close } from '../methods';

const useStyles = makeStyles(theme => ({
  pre: {
    padding: theme.spacing(2),
  },
}));

function Mode({ appState }) {
  const classes = useStyles();
  return (
    <Frame onClick={() => ipcRenderer.send(Close)}>
      primary={`${appState.code[0].toUpperCase()}${appState.code.substring(1)}`}
      >
      <Alerts appState={appState} />
      <pre className={classes.pre}>
        <code>{appState.state.join('\n')}</code>
      </pre>
    </Frame>
  );
}

export default Mode;
