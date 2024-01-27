import React, { useState }from 'react';
import {IconButton} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';

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

  const resumeButton = (
    <IconButton size="large" title="Resume Playback" onClick={resume} id="audio-button-resume">
      <PlayArrowIcon fontSize='large' />
    </IconButton>
  );

  const pauseButton = (
    <IconButton size="large" title="Pause Playback" onClick={pause} id="audio-button-pause">
      <PauseIcon fontSize='large' />
    </IconButton>
  );

  return (
    <div id="tts-controls">
      <IconButton size="large" title="Previous Sentence" onClick={() => params.app.tts.previousSentence()} id="audio-button-prev">
        <SkipPreviousIcon fontSize='large' />
      </IconButton>
      { paused
        ? resumeButton
        : pauseButton
      }
      <IconButton size="large" title="Stop Playback" onClick={params.onStop} id="audio-button-stop">
        <StopIcon fontSize='large' />
      </IconButton>
      <IconButton size="large" title="Next Sentence" onClick={() => params.app.tts.nextSentence()} id="audio-button-next">
        <SkipNextIcon fontSize='large' />
      </IconButton>
    </div>
  );
};
