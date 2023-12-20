import React from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';

import { SettingsAppBar } from './SettingsAppBar';

import './Settings.css';
import {Typography} from '@mui/material';

export const Settings = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  const [alignment, setAlignment] = React.useState<string | null>('left');

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newAlignment: string | null,
  ) => {
    setAlignment(newAlignment);
  };

  return (
    <div id="settings-view">
      <SettingsAppBar onBack={goBack} />
      <Container
        sx={{
          minWidth: 'xs',
          maxWidth: 'sm',
          padding: 0,
          height: '100%',
          flexGrow: 1,
        }}
      >
        <Paper
          elevation={1}
          square={true}
          sx={{
            width: '100%',
            margin: 0,
            marginTop: { xs: 0, sm: 2 },
            height: { xs: '100%', sm: 'fit-content' },
            padding: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                flexGrow: 1,
              }}
            >
              TTS Engine
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={alignment}
              exclusive
              onChange={handleChange}
              aria-label="TTS Engine"
            >
              <ToggleButton value="mimic3">Mimic 3</ToggleButton>
              <ToggleButton value="webtts">Web TTS</ToggleButton>
              <ToggleButton disabled value="subscription">Subscription</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};
