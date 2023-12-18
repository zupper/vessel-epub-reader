import { createRoot } from 'react-dom/client';
import React from 'react';

import config from './config';
import App from './app/App';
import EpubjsBookReader from "./infra/epub/EpubjsBookReader";
import Mimic3TTSSource from 'infra/tts/mimic/Mimic3TTSSource';
import WebSpeechTTSSource from 'infra/tts/WebSpeechTTSSource';
import LocalStringStorage from 'infra/LocalStringStorage';
import DefaultBookSourceReader from 'infra/DefaultBookSourceReader';
import OPFSBookRepository from 'infra/OPFSBookRepository';

import { Entrypoint } from './view/Entrypoint';

window.addEventListener(
  "load",
  async () => {

    const tts = config.tts === 'mimic3'
                  ? new Mimic3TTSSource(config.mimicApiUrl)
                  : new WebSpeechTTSSource();
    const reader = new EpubjsBookReader();
    const app = new App({
      bookReader: reader,
      io: {
        stringStorage: new LocalStringStorage(),
        bookSourceReader: new DefaultBookSourceReader(),
      },
      /// tts: new Mimic3TTSSource(config.mimicApiUrl),
      tts,
      bookRepository: new OPFSBookRepository(),
    });

    const root = createRoot(document.querySelector('#app-container'));
    root.render(React.createElement(Entrypoint, { app }));
  });
