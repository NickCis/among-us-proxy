import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import HostDialog from './HostDialog';
import HostSetupDialog from './HostSetupDialog';
import { RunHost, RunGuest, Close } from '../methods';

const useStyles = makeStyles(theme => ({
  list: {
    padding: 0,
  },
  typography: {
    margin: theme.spacing(3, 0, 0),
  },
  paper: {
    margin: theme.spacing(2, 0),
  },
}));

function Home() {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [openSetup, setOpenSetup] = useState(false);

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
      <HostSetupDialog
        open={openSetup}
        onSubmit={config => {
          setOpenSetup(false);
          ipcRenderer.send(RunHost, config);
        }}
        onClose={() => setOpenSetup(false)}
      />
      <Typography className={classes.typography}>Create a proxy</Typography>
      <Paper className={classes.paper}>
        <List className={classes.list}>
          <ListItem button onClick={() => ipcRenderer.send(RunHost)}>
            <ListItemText primary="Host" />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => setOpenSetup(true)}>
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem button onClick={() => setOpen(true)}>
            <ListItemText primary="Guest" />
            <ListItemSecondaryAction>
              <IconButton edge="end">
                <ChevronRightIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
    </>
  );
}

export default Home;
