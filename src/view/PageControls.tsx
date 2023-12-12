import React, {useRef, useEffect, KeyboardEvent } from 'react';
import App from 'app/App';

export type PageControlsParams = {
  app: App;
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


  const prevPage = () => params.app.nav.prevPage();
  const nextPage = () => params.app.nav.nextPage();

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') prevPage();
    else if (e.key === 'ArrowRight') nextPage();
  };

  return (
    <div id="page-controls" onKeyUp={handleKeyPress} tabIndex={0} role="button" ref={divAutoFocusRef}>
      <button title="Previous Page" onClick={prevPage} id="prev">◀</button>
      <button title="Next Page" onClick={nextPage} id="next">▶</button>
      <button title="Table of Contents" onClick={params.onTableOfContents} id="toc-button">📋</button>
      <button title="Start text-to-speech" onClick={params.onStartTTS} id="start-tts-button">🗣</button>
    </div>
  );
};
