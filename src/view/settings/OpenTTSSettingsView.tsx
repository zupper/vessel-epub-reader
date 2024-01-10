import React, {useEffect, useState} from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export type OpenTTSSettingsView  = {
  url?: string;
  auth?: {
    type: 'None' | 'Basic',
    username?: string;
    password?: string;
  };
  onChange: (pairs: { key: string; value: string }[]) => boolean;
}

export const OpenTTSSettingsView = (params: OpenTTSSettingsView) => {
  const [authType, setAuthType] = useState(params?.auth?.type ?? 'None');
  const [username, setUsername] = useState(params?.auth?.username ?? '');
  const [password, setPassword] = useState(params?.auth?.password ?? '');
  const [authVisible, setAuthVisible] = useState(params?.auth?.type === 'Basic');

  const [urlError, setUrlError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    setAuthType(params.auth?.type);
    setUsername(params.auth?.username);
    setPassword(params.auth?.password);
    setAuthVisible(params.auth?.type === 'Basic');
  }, [params.url, params.auth]);

  const changeApiUrl = (e: React.ChangeEvent<HTMLInputElement>) => setUrlError(!params.onChange([{ key: 'apiUrl', value: e.target.value }]));

  const changeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsernameError(e.target.value === '');
    setUsername(e.target.value);
    params.onChange([
      { key: 'authType', value: 'Basic' },
      { key: 'username', value: e.target.value },
      { key: 'password', value: password }
    ]);
  };

  const changePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordError(e.target.value === '');
    setPassword(e.target.value);
    params.onChange([
      { key: 'authType', value: 'Basic' },
      { key: 'username', value: username },
      { key: 'password', value: e.target.value }
    ]);
  };

  const changeAuthType = (e: SelectChangeEvent) => {
    setAuthType(e.target.value as 'None' | 'Basic');
    setAuthVisible(e.target.value === 'Basic');

    if (e.target.value === 'None') {
      setUsername(null);
      setPassword(null);
      params.onChange([
        { key: 'authType', value: 'None' },
        { key: 'username', value: null },
        { key: 'password', value: null }
      ]);
    }
    else {
      params.onChange([
        { key: 'authType', value: 'Basic' },
        { key: 'username', value: username },
        { key: 'password', value: password }
      ]);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 2,
        gap: 2,
    }}>
      { !params.url
        ? <CircularProgress /> 
        : <>
            <TextField
              id="apiUrl"
              error={urlError}
              sx={{ width: '100%' }}
              label="API Url"
              defaultValue={params.url}
              onChange={changeApiUrl}
            />
            <FormControl fullWidth>
              <InputLabel id="auth-type-select">Auth Type</InputLabel>
              <Select
                labelId="auth-type-select"
                id="auth-type-select"
                value={authType}
                label="Auth Type"
                onChange={changeAuthType}
              >
                <MenuItem value="None">None</MenuItem>
                <MenuItem value="Basic">Basic</MenuItem>
              </Select>
            </FormControl>
            { !authVisible
              ? null
              : <>
                  <TextField
                    id="username"
                    error={usernameError}
                    sx={{ width: '100%' }}
                    label="Username"
                    defaultValue={params.auth?.username ?? ''}
                    onChange={changeUsername}
                  />
                  <TextField
                    id="password"
                    type="password"
                    error={passwordError}
                    sx={{ width: '100%' }}
                    label="Password"
                    defaultValue={params.auth?.password ?? ''}
                    onChange={changePassword}
                  />
                </>
            }
          </>
      }
    </Box>
  );
};
