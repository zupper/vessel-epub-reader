import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';

import App from 'app/App';
import {TTSPlaybacControls} from './TTSPlaybackControls';

import './ReaderControls.css';

export type ReaderControlsParams = {
  app: App;
  onTableOfContents: () => unknown;
};

export const ReaderControls = (params: ReaderControlsParams) => {
  const [playing, setPlaying] = useState(false);
  const divAutoFocusRef = useRef(null);

  useEffect(() => {
    if (divAutoFocusRef.current) {
      divAutoFocusRef.current.focus();
    }
  }, []);

  const startTTS = async () => {
    await params.app.tts.startReading()
    setPlaying(true);
  };

  const stopTTS = () => {
    params.app.tts.stopReading();
    setPlaying(false);
  };

  const prevPage = () => params.app.nav.prevPage();
  const nextPage = () => params.app.nav.nextPage();

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') prevPage();
    else if (e.key === 'ArrowRight') nextPage();
  };

  return (
    <div id="reading-controls">
      <div id="page-controls" onKeyUp={handleKeyPress} tabIndex={0} role="button" ref={divAutoFocusRef}>
        <button title="Previous Page" onClick={prevPage} id="prev">◀</button>
        <button title="Next Page" onClick={nextPage} id="next">▶</button>
        <button title="Table of Contents" onClick={params.onTableOfContents} id="toc-button">📋</button>
        { !playing
            ?  <button title="Start text-to-speech" onClick={startTTS} id="start-tts-button">🗣</button>
            : ''
          }
      </div>
      { playing
          ? <TTSPlaybacControls app={params.app} onStop={stopTTS} />
          : ''
      }
    </div>
  )
};
