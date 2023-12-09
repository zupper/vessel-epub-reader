import { createRoot } from 'react-dom/client';
import React from 'react';

import config from './config';
import App from './app/App';
import EpubjsBookReader from "./infra/epub/EpubjsBookReader";
import HowlerPlayer from 'infra/HowlerPlayer';
import Mimic3TTSSource from 'infra/Mimic3TTSSource';
import LocalStringStorage from 'infra/LocalStringStorage';
import DefaultBookSourceReader from 'infra/DefaultBookSourceReader';
import OPFSBookRepository from 'infra/OPFSBookRepository';

import { Entrypoint } from './view/Entrypoint';

// import SimpleReadingArea from './infra/view/SimpleReadingArea';
// import LibraryView from 'infra/view/LibraryView';

window.addEventListener(
  "load",
  async () => {
    const reader = new EpubjsBookReader();
    const app = new App({
      bookReader: reader,
      io: {
        stringStorage: new LocalStringStorage(),
        bookSourceReader: new DefaultBookSourceReader(),
      },
      player: new HowlerPlayer(),
      tts: new Mimic3TTSSource(config.mimicApiUrl),
      bookRepository: new OPFSBookRepository(),
    });

    // const libraryView = new LibraryView(app);

    // const readingArea = new SimpleReadingArea(app);
    // reader.view = readingArea.view;

    // §document.querySelector('body').appendChild(readingArea);
    
    const root = createRoot(document.querySelector('#app-container'));
    root.render(React.createElement(Entrypoint, { app }));
  });
