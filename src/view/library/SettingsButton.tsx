import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';

export type SettingsButtonParams = {
  onClick: () => unknown;
};

export const SettingsButton = (params: SettingsButtonParams) => {
  return (
    <Box onClick={params.onClick}>
      <Button
        sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}
        color="inherit">
        SETTINGS
      </Button>
      <IconButton
        size="large"
        sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
        color="inherit">
        <SettingsIcon />
      </IconButton>
    </Box>
  );
};
