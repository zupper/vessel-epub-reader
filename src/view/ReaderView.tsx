import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';

import App from 'app/App';
import {ToCItem} from 'app/Book';
import EpubjsBookReader from 'infra/epub/EpubjsBookReader';

import { ReaderControls } from './ReaderControls';
import { TableOfContentsView } from './TableOfContentsView';

import './ReaderView.css';

export type ReaderViewProps = {
  app: App;
};

export const ReaderView = (params: ReaderViewProps) => {
  const [book, setBook] = useState(null);
  const [tocVisible, setTocVisible] = useState(false);

  const location = useLocation();
  const renderAreaRef = useRef(null);

  useEffect(() => {
    const reader = (params.app.reader as EpubjsBookReader);
    if (renderAreaRef.current) {
      reader.view = renderAreaRef.current;
      params.app.openBook(location.state.bookId).then(setBook);
    }

    return () => { reader.view = null };
  }, []);

  const showToC = () => setTocVisible(true);
  const hideToC = () => setTocVisible(false);

  const goTo = (i: ToCItem) => {
    hideToC();
    params.app.nav.moveTo(i.link);
  };

  return (
    <div
      id="reader-view"
      style={{ position: 'relative', height: '100%' }}>
      <div
        id="render-area"
        ref={renderAreaRef}
        style={{ height: '100%', width: '100%' }}></div>
      <ReaderControls app={params.app} onTableOfContents={showToC}  />
      <CSSTransition
        in={tocVisible}
        timeout={300}
        classNames="toc-fade"
        unmountOnExit>
        <TableOfContentsView toc={book?.toc} onClose={hideToC} onItemClick={goTo} />
       </CSSTransition>
    </div>
  );
};
