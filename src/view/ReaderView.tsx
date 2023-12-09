import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import App from 'app/App';
import EpubjsBookReader from 'infra/epub/EpubjsBookReader';

export type ReaderViewProps = {
  app: App;
};

export const ReaderView = (params: ReaderViewProps) => {
  const location = useLocation();
  const renderAreaRef = useRef(null);

  useEffect(() => {
    if (renderAreaRef.current) {
      (params.app.reader as EpubjsBookReader).view = renderAreaRef.current;
      params.app.openBook(location.state.bookId);
    }
  });

  return (
    <div
      id="reader-view"
      style={{ position: 'relative', height: '100%' }}>
      <div
        id="render-area"
        ref={renderAreaRef}
        style={{ height: '100%', width: '100%' }}></div>
      <div
        id="menu"
        style={{ position: 'absolute', bottom: '0px' }}></div>
    </div>
  );
};
