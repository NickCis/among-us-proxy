import { useState, useEffect } from 'react';
import { GetAppState } from '../methods';

function useAppState() {
  const [state, setState] = useState({ code: 'none' });

  useEffect(() => {
    function handler(event, state) {
      setState(state);
    }

    ipcRenderer.on(GetAppState, handler);
    ipcRenderer.send(GetAppState);

    return () => {
      ipcRenderer.removeListener(GetAppState, handler);
    };
  }, []);

  return state;
}

export default useAppState;
