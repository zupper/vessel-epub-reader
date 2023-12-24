import React, {useState} from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import { TTSSourceConfig } from 'app/tts/TTSSource';

export type OpenTTSSettingsView  = {
  config: TTSSourceConfig;
  onChange: (key: string, value: string) => boolean;
}

export const OpenTTSSettingsView = (params: OpenTTSSettingsView) => {
  const [error, setError] = useState(false);
  const changeApiUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(!params.onChange('apiUrl', e.target.value));
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 2,
    }}>
      { params.config === null 
        ? <CircularProgress /> 
        : <TextField
            id="apiUrl"
            error={error}
            sx={{ width: '100%' }}
            label="API Url"
            defaultValue={params.config.apiUrl.value}
            onChange={changeApiUrl}
          />
      }
    </Box>
  );
};
