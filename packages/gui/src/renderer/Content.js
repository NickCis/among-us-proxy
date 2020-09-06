import React, { useState } from 'react';
import useAppState from './useAppState';
import Home from './Home';
import Mode from './Mode';

function Content() {
  const appState = useAppState();

  switch (appState.code) {
    case 'none':
      return <Home />;

    default:
      return <Mode appState={appState} />;
  }
}

export default Content;
