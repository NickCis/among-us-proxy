import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import useAppState from './useAppState';
import { Close } from '../methods';

const useStyles = makeStyles(theme => ({
  paper: {
    // padding: theme.spacing(2),
    // margin: theme.spacing(2, 0),
  },
  list: {
    padding: 0,
  },
  pre: {
    padding: theme.spacing(2),
  },
}));

function Mode({ appState }) {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <List className={classes.list} dense>
        <ListItem>
          <ListItemIcon>
            <IconButton edge="start" onClick={() => ipcRenderer.send(Close)}>
              <ArrowBackIcon />
            </IconButton>
          </ListItemIcon>
          <ListItemText
            primary={`${appState.code[0].toUpperCase()}${appState.code.substring(
              1
            )}`}
          />
        </ListItem>
      </List>
      {appState.error && (
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {appState.error}
        </Alert>
      )}
      {appState.url && (
        <Alert severity="success">
          <AlertTitle>Success</AlertTitle>
          Others should use this url: <strong>{appState.url}</strong>
        </Alert>
      )}
      <pre className={classes.pre}>
        <code>{appState.state.join('\n')}</code>
      </pre>
    </Paper>
  );
}

export default Mode;
