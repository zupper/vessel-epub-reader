import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';

import App from 'app/App';

import { SettingsAppBar } from './SettingsAppBar';

import './Settings.css';
import {Typography} from '@mui/material';
import { OpenTTSSettingsView } from './OpenTTSSettingsView';

export type SettingsParams = {
  app: App;
}

export const Settings = (params: SettingsParams) => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  const [ttsSource, setTTSSource] = useState('webtts');
  const [config, setConfig] = useState(null);

  useEffect(() => {
    setTTSSource(params.app.tts.getCurrentSource().id());
    params.app.tts.getCurrentSourceConfig().then(setConfig);
  }, []);

  const handleChangeSource = async (
    _: React.MouseEvent<HTMLElement>,
    newSource: string | null,
  ) => {
    await params.app.tts.changeSource(newSource);
    setTTSSource(newSource);
    setConfig(null);
    setConfig(await params.app.tts.getCurrentSourceConfig());
  };

  const updateConfig = (pairs: { key: string, value: string }[]) => {
    let newConfig = config;
    for (const { key, value } of pairs) {
      const newValue = { ...newConfig[key], value };
      newConfig = {...newConfig, [key]: newValue };
    }

    try {
      params.app.tts.updateCurrentSourceConfig(newConfig);
      setConfig(newConfig);
      return true;
    }
    catch(e) {
      console.log(e);
      return false;
    }
  };

  return (
    <div id="settings-view">
      <SettingsAppBar onBack={goBack} />
      <Container
        id='settings-main-content'
        sx={{
          minWidth: 'xs',
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
            minHeight: '200px',
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
              value={ttsSource}
              exclusive
              onChange={handleChangeSource}
              aria-label="TTS Engine"
            >
              <ToggleButton value="webtts">Web Speech TTS</ToggleButton>
              <ToggleButton value="opentts">Open TTS Server</ToggleButton>
              <ToggleButton disabled value="subscription">Subscription</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          { ttsSource === 'webtts'
            ? <div>web tts config</div>
            : <OpenTTSSettingsView
                url={config?.apiUrl?.value}
                auth={{
                  type: config?.authType?.value ?? 'None',
                  username: config?.username?.value,
                  password: config?.password?.value,
                }}
                onChange={updateConfig}
              />
          }
        </Paper>
      </Container>
    </div>
  );
};
