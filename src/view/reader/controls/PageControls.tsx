import React, {useRef, useEffect, KeyboardEvent } from 'react';

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
      <button title="Previous Page" onClick={params.onPrevPage} id="prev">◀</button>
      <button title="Table of Contents" onClick={params.onTableOfContents} id="toc-button">📋</button>
      <button title="Start text-to-speech" onClick={params.onStartTTS} id="start-tts-button">🗣</button>
      <button title="Next Page" onClick={params.onNextPage} id="next">▶</button>
    </div>
  );
};
