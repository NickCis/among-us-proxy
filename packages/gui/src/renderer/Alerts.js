import React from 'react';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

function Alerts({ appState }) {
  return (
    <>
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
    </>
  );
}

export default Alerts;
