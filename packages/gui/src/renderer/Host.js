import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import InboxIcon from '@material-ui/icons/Inbox';
import DeleteIcon from '@material-ui/icons/Delete';

import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Frame from './Frame';
import Alerts from './Alerts';
import { Close, RemoveGuest } from '../methods';

const Accordion = withStyles({
  root: {
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles(theme => ({
  root: {
    padding: theme.spacing(2.5, 2.5, 0),
    '&$expanded': {
      minHeight: 0,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
}))(MuiAccordionSummary);

const AccordionDetails = withStyles({
  root: {
    padding: 0,
  },
})(MuiAccordionDetails);

const useStyles = makeStyles(theme => ({
  title: {
    ...theme.typography.subtitle2,
    padding: theme.spacing(4, 2.5, 1.5),
    fontSize: theme.typography.pxToRem(13),
  },
  expandTitle: {
    ...theme.typography.subtitle2,
    fontSize: theme.typography.pxToRem(13),
  },
  pre: {
    margin: 0,
    padding: theme.spacing(0, 2, 2),
  },
}));

function Host({ appState }) {
  const classes = useStyles();
  return (
    <Frame onClick={() => ipcRenderer.send(Close)} primary="Host">
      <Alerts appState={appState} />
      <Typography className={classes.title}>Connected Users</Typography>
      <List>
        {appState.connections.map((conn, i) => (
          <React.Fragment key={conn.key}>
            {!!i && <Divider />}
            <ListItem>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary={conn.remoteAddress} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => ipcRenderer.send(RemoveGuest, conn.key)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.expandTitle}>Log</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <pre className={classes.pre}>
            <code>{appState.state.join('\n')}</code>
          </pre>
        </AccordionDetails>
      </Accordion>
    </Frame>
  );
}

export default Host;
