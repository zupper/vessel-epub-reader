import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';

import App from 'app/App';
import {BookLocation, ToCItem} from 'app/Book';
import EpubjsBookReader from 'infra/epub/EpubjsBookReader';

import { ReaderControls } from './controls/ReaderControls';
import { TableOfContentsView } from './toc/TableOfContentsView';
import { ChapterInfo } from './ChapterInfo';

import './ReaderView.css';

export type ReaderViewProps = {
  app: App;
};

export const ReaderView = (params: ReaderViewProps) => {
  const [tocVisible, setTocVisible] = useState(false);
  const [toc, setToC] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const location = useLocation();
  const renderAreaRef = useRef(null);

  const updateToC = (loc: BookLocation) => setCurrentLocation(loc);

  useEffect(() => {
    const reader = (params.app.reader as EpubjsBookReader);
    if (renderAreaRef.current) {
      reader.view = renderAreaRef.current;
      params.app.openBook(location.state.bookId)
        .then(({ toc, currentLocation }) => {
          setToC(toc);
          setCurrentLocation(currentLocation);
        });
    }

    return () => { reader.view = null };
  }, []);

  const showToC = () => setTocVisible(true);
  const hideToC = () => setTocVisible(false);

  const goTo = (i: ToCItem) => {
    hideToC();
    params.app.nav.moveTo(i.link)
      .then(updateToC);
  };

  const nextPage = () => params.app.nav.nextPage().then(updateToC);
  const prevPage = () => params.app.nav.prevPage().then(updateToC);

  return (
    <div
      id="reader-view">
      <div
        id="render-area"
        ref={renderAreaRef}></div>
      <div id="controls-area">
        <ReaderControls
          app={params.app}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          onTableOfContents={showToC} />
        <ChapterInfo
          chapter={currentLocation?.chapter}
          chapterProgress={currentLocation?.chapterProgress} />
      </div>
      <CSSTransition
        in={tocVisible}
        timeout={300}
        classNames="toc-fade"
        unmountOnExit>
        <TableOfContentsView
          toc={toc}
          currentChapter={currentLocation?.chapter}
          onClose={hideToC}
          onItemClick={goTo} />
       </CSSTransition>
    </div>
  );
};
