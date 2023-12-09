import React from 'react';
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';

import App from 'app/App';

import { LibraryView } from './LibraryView';
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
        <Route path="/" element={<LibraryView app={params.app} />} />
        <Route path="/read" element={<Reader />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
};
