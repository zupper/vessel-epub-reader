import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import App from 'app/App';

import { Library } from './Library';
import { Reader } from './Reader';
import { Settings } from './Settings';

export type EntrypointParams = {
  app: App;
}

export const Entrypoint = (params: EntrypointParams) => {
  console.log(params.app);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/read" element={<Reader />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
};
