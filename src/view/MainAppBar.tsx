import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import App from 'app/App';

import { AddBookView } from './AddBookView';

export type MainAppBarParams = {
  app: App;
  onBookAdded: () => unknown
}

export const MainAppBar = (params: MainAppBarParams) => {

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Epub Library
          </Typography>
          <AddBookView app={params.app} onBookAdded={params.onBookAdded}  />
        </Toolbar>
      </AppBar>
    </Box>
  );
};
