import React, { useState }from 'react';

import App from 'app/App';

export type TTSPlaybacControlsParams = {
  app: App;
  onStop: () => unknown;
};

export const TTSPlaybacControls = (params: TTSPlaybacControlsParams) => {
  const [paused, setPaused] = useState(false);
  const pause = () => {
    params.app.tts.pauseReading();
    setPaused(true);
  };

  const resume = () => {
    params.app.tts.resumeReading();
    setPaused(false);
  };

  return (
    <div id="tts-controls">
      <button title="Previous Sentence" onClick={() => params.app.tts.previousSentence()} id="audio-button-prev">⏮</button>
      { paused
        ? <button title="Resume Playback" onClick={resume} id="audio-button-resume">⏯</button>
        : <button title="Pause Playback" onClick={pause} id="audio-button-pause">⏸</button>
      }
      <button title="Stop Playback" onClick={params.onStop} id="audio-button-stop">⏹</button>
      <button title="Next Sentence" onClick={() => params.app.tts.nextSentence()} id="audio-button-next">⏭</button>
    </div>
  );
};
