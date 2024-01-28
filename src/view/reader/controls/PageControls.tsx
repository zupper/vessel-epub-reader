import React, {useRef, useEffect, KeyboardEvent } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TocIcon from '@mui/icons-material/Toc';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import {IconButton} from '@mui/material';

export type PageControlsParams = {
  onNextPage: () => unknown;
  onPrevPage: () => unknown;
  onStartTTS: () => unknown;
  onTableOfContents: () => unknown;
}

export const PageControls = (params: PageControlsParams) => {
  const divAutoFocusRef = useRef(null);

  useEffect(() => {
    if (divAutoFocusRef.current) {
      divAutoFocusRef.current.focus();
    }
  }, []);


  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') params.onPrevPage();
    else if (e.key === 'ArrowRight') params.onNextPage();
  };

  return (
    <div id="page-controls" onKeyUp={handleKeyPress} tabIndex={0} role="button" ref={divAutoFocusRef}>
      <div onClick={params.onPrevPage} id="prev">
        <IconButton size="large" title="Previous Page" >
          <ArrowBackIcon fontSize='large' />
        </IconButton>
      </div>
      <IconButton size="large" title="Table of Contents" onClick={params.onTableOfContents} id="toc-button">
        <TocIcon fontSize='large' />
      </IconButton>
      <IconButton size="large" title="Start text-to-speech" onClick={params.onStartTTS} id="start-tts-button">
        <HeadphonesIcon fontSize='large' />
      </IconButton>
      <div onClick={params.onNextPage} id="next">
        <IconButton size="large" title="Next Page" >
          <ArrowForwardIcon fontSize='large' />
        </IconButton>
      </div>
    </div>
  );
};
