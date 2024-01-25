import React, { useState } from 'react';

import App from 'app/App';

import { TTSPlaybacControls } from './TTSPlaybackControls';
import { PageControls } from './PageControls';

import './ReaderControls.css';

export type ReaderControlsParams = {
  app: App;
  onPrevPage: () => unknown;
  onNextPage: () => unknown;
  onTableOfContents: () => unknown;
};

export const ReaderControls = (params: ReaderControlsParams) => {
  const [playing, setPlaying] = useState(false);

  const startTTS = async () => {
    await params.app.tts.startReading()
    setPlaying(true);
  };

  const stopTTS = () => {
    params.app.tts.stopReading();
    setPlaying(false);
  };

  return (
    <div id="reading-controls">
      { playing
          ? <TTSPlaybacControls app={params.app} onStop={stopTTS} />
          : <PageControls
              onNextPage={params.onNextPage}
              onPrevPage={params.onPrevPage}
              onStartTTS={startTTS}
              onTableOfContents={params.onTableOfContents} />
      }
    </div>
  )
};
