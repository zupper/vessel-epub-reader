import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import App from 'app/App';

import { AddBookView } from './AddBookView';
import {SettingsButton} from './SettingsButton';

export type MainAppBarParams = {
  app: App;
  onBookAdded: () => unknown;
  onSettingsClick: () => unknown;
}

export const MainAppBar = (params: MainAppBarParams) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Epub Library
          </Typography>
          <SettingsButton onClick={params.onSettingsClick} />
          <AddBookView app={params.app} onBookAdded={params.onBookAdded}  />
        </Toolbar>
      </AppBar>
    </Box>
  );
};
