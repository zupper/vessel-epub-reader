import { createRoot } from 'react-dom/client';
import React from 'react';

import App from './app/App';
import EpubjsBookReader from "./infra/epub/EpubjsBookReader";
import DefaultTTSSourceProvider from 'infra/tts/DefaultTTSSourceProvider';
import LocalStringStorage from 'infra/LocalStringStorage';
import DefaultBookSourceReader from 'infra/DefaultBookSourceReader';
import OPFSBookRepository from 'infra/OPFSBookRepository';
import WebSpeechTTSFactory from 'infra/tts/webspeech/WebSpeecnTTSFactory';
import OpenTTSFactory from 'infra/tts/opentts/OpenTTSFactory';

import { Entrypoint } from './view/Entrypoint';

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
      tts: new DefaultTTSSourceProvider([
        new WebSpeechTTSFactory(),
        new OpenTTSFactory(),
      ]),
      bookRepository: new OPFSBookRepository(),
    });

    const root = createRoot(document.querySelector('#app-container'));
    root.render(React.createElement(Entrypoint, { app }));
  });
