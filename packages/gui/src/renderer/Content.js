import React, { useState } from 'react';
import useAppState from './useAppState';
import Home from './Home';
import Host from './Host';
import Mode from './Mode';

function Content() {
  const appState = useAppState();

  switch (appState.code) {
    case 'none':
      return <Home />;

    case 'host':
      return <Host appState={appState} />;

    default:
      return <Mode appState={appState} />;
  }
}

export default Content;
