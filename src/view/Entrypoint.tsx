import React from 'react';
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import App from 'app/App';

import { BookLocationProvider } from './BookLocationContext';
import { LibraryView } from './library/LibraryView';
import { Settings } from './settings/Settings';
import { ReaderView } from './reader/ReaderView';

export type EntrypointParams = {
  app: App;
}

export const Entrypoint = (params: EntrypointParams) => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LibraryView app={params.app} />} />
          <Route path="/read" element={
            <BookLocationProvider app={params.app}>
              <ReaderView app={params.app} />
            </BookLocationProvider>
          } />
        <Route path="/settings" element={<Settings app={params.app} />} />
      </Routes>
    </Router>
  );
};
