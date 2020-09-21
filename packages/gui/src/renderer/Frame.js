import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const useStyles = makeStyles(theme => ({
  list: {
    padding: 0,
  },
}));

function Frame({ onClick, primary, children }) {
  const classes = useStyles();
  return (
    <Paper>
      <List className={classes.list} dense>
        <ListItem>
          <ListItemIcon>
            <IconButton edge="start" onClick={onClick}>
              <ArrowBackIcon />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary={primary} />
        </ListItem>
      </List>
      {children}
    </Paper>
  );
}

export default Frame;
