import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function HostDialog({ onSubmit, onClose, open }) {
  const [host, setHost] = useState('');
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <form
        onSubmit={ev => {
          ev.preventDefault();
          onSubmit(host);
        }}
      >
        <DialogTitle id="form-dialog-title">Host URL</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To connect, please enter the Host url.
          </DialogContentText>
          <TextField
            value={host}
            onChange={ev => setHost(ev.target.value)}
            autoFocus
            margin="dense"
            label="Host URL"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary">
            Connect
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default HostDialog;
