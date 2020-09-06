import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Content from './Content';

const useStyles = makeStyles(theme => ({
  title: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(6),
  },
}));

function App() {
  const classes = useStyles();

  return (
    <>
      <CssBaseline />
      <AppBar elevation={0}>
        <Toolbar variant="dense">
          <Typography
            component="h1"
            variant="subtitle1"
            color="inherit"
            className={classes.title}
            noWrap
          >
            Among Us Proxy
          </Typography>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <Container maxWidth="sm" className={classes.container}>
          <Content />
        </Container>
      </main>
    </>
  );
}

export default App;
