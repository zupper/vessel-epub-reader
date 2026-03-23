import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';

import App from 'app/App';
import { ToCItem } from 'app/Book';
import {
  ThemeId, getTheme, getThemeVars,
  FontSize, getNextFontSize, getPrevFontSize,
  FontFamilyId, getNextFontFamily, getPrevFontFamily,
} from 'app/ReaderTheme';
import EpubjsBookReader from 'infra/epub/EpubjsBookReader';

import { ControlsDrawer } from './controls/ControlsDrawer';
import { ReaderControls } from './controls/ReaderControls';
import { TableOfContentsView } from './toc/TableOfContentsView';
import { ChapterInfo } from './ChapterInfo';

import './ReaderView.css';
import { useBookLocationContext } from '../BookLocationContext';

function applyCssVars(themeId: ThemeId) {
  const vars = getThemeVars(themeId);
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
}

export type ReaderViewProps = {
  app: App;
};

export const ReaderView = (params: ReaderViewProps) => {
  const [tocVisible, setTocVisible] = useState(false);
  const [toc, setToC] = useState(null);
  const [themeId, setThemeId] = useState<ThemeId>(() => params.app.themeId);
  const [fontSize, setFontSize] = useState<FontSize>(() => params.app.fontSize);
  const [fontFamilyId, setFontFamilyId] = useState<FontFamilyId>(() => params.app.fontFamilyId);
  const bookReadyRef = useRef(false);
  const currentLocation = useBookLocationContext();

  const location = useLocation();
  const renderAreaRef = useRef(null);

  useEffect(() => {
    applyCssVars(themeId);
    if (bookReadyRef.current) {
      params.app.reader.setTheme(getTheme(themeId));
    }
  }, [themeId]);

  useEffect(() => {
    if (bookReadyRef.current) {
      params.app.setFontSize(fontSize);
    }
  }, [fontSize]);

  useEffect(() => {
    if (bookReadyRef.current) {
      params.app.setFontFamily(fontFamilyId);
    }
  }, [fontFamilyId]);

  useEffect(() => {
    const reader = (params.app.reader as EpubjsBookReader);
    if (renderAreaRef.current) {
      reader.view = renderAreaRef.current;
      params.app.openBook(location.state.bookId)
        .then(({ toc }) => {
          setToC(toc);
          bookReadyRef.current = true;
          params.app.reader.setTheme(getTheme(themeId));
          params.app.setFontSize(fontSize);
          params.app.setFontFamily(fontFamilyId);
        });
    }

    return () => {
      params.app.tts.stopReading();
      bookReadyRef.current = false;
      reader.view = null;
    };
  }, []);

  const selectTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    params.app.setTheme(id);
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSize(prev => {
      const next = getNextFontSize(prev);
      return next ?? prev;
    });
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize(prev => {
      const next = getPrevFontSize(prev);
      return next ?? prev;
    });
  }, []);

  const nextFontFamily = useCallback(() => {
    setFontFamilyId(prev => getNextFontFamily(prev));
  }, []);

  const prevFontFamily = useCallback(() => {
    setFontFamilyId(prev => getPrevFontFamily(prev));
  }, []);

  const showToC = () => setTocVisible(true);
  const hideToC = () => setTocVisible(false);

  const goTo = (i: ToCItem) => {
    hideToC();
    params.app.nav.moveTo(i.link);
  };

  const nextPage = () => params.app.nav.nextPage();
  const prevPage = () => params.app.nav.prevPage();

  return (
    <div
      id="reader-view">
      <div
        id="render-area"
        ref={renderAreaRef}></div>
      <ControlsDrawer
        themeId={themeId}
        onSelectTheme={selectTheme}
        fontSize={fontSize}
        onIncreaseFontSize={increaseFontSize}
        onDecreaseFontSize={decreaseFontSize}
        fontFamilyId={fontFamilyId}
        onNextFontFamily={nextFontFamily}
        onPrevFontFamily={prevFontFamily}>
        <ReaderControls
          app={params.app}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          onTableOfContents={showToC} />
        <ChapterInfo
          chapter={currentLocation?.chapter}
          chapterProgress={currentLocation?.chapterProgress} />
      </ControlsDrawer>
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
