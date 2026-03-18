import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import App from 'app/App';
import { ToCItem } from 'app/Book';
import EpubjsBookReader from 'infra/epub/EpubjsBookReader';

import { ReaderControls } from './controls/ReaderControls';
import { TableOfContentsView } from './toc/TableOfContentsView';
import { ChapterInfo } from './ChapterInfo';

import './ReaderView.css';
import { useBookLocationContext } from '../BookLocationContext';

const DARK_MODE_KEY = 'reader-dark-mode';

const DARK_VARS: Record<string, string> = {
  '--reader-bg': '#1a1a1a',
  '--reader-bg-overlay': '#2a2a2abf',
  '--reader-text': '#e8e8e8',
  '--reader-text-secondary': '#a0a0a09f',
  '--reader-toc-bg': '#2a2a2a',
  '--reader-toc-text': '#e8e8e8',
};

const LIGHT_VARS: Record<string, string> = {
  '--reader-bg': '#ffffff',
  '--reader-bg-overlay': '#ffffffbf',
  '--reader-text': '#333333',
  '--reader-text-secondary': '#7575759f',
  '--reader-toc-bg': '#ffffff',
  '--reader-toc-text': 'black',
};

function applyCssVars(isDark: boolean) {
  const vars = isDark ? DARK_VARS : LIGHT_VARS;
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
}

const preventTouchMove = (e: TouchEvent) => e.preventDefault();

export type ReaderViewProps = {
  app: App;
};

export const ReaderView = (params: ReaderViewProps) => {
  const [tocVisible, setTocVisible] = useState(false);
  const [toc, setToC] = useState(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem(DARK_MODE_KEY) === 'true');
  const bookReadyRef = useRef(false);
  const currentLocation = useBookLocationContext();

  const location = useLocation();
  const renderAreaRef = useRef(null);

  const controlsAreaRef = useRef(null);

  useEffect(() => {
    applyCssVars(isDark);
    if (bookReadyRef.current) {
      params.app.reader.setTheme(isDark);
    }
  }, [isDark]);

  useEffect(() => {
    const reader = (params.app.reader as EpubjsBookReader);
    if (renderAreaRef.current) {
      reader.view = renderAreaRef.current;
      params.app.openBook(location.state.bookId)
        .then(({ toc }) => {
          setToC(toc);
          bookReadyRef.current = true;
          params.app.reader.setTheme(isDark);
        });
    }

    if (controlsAreaRef.current) {
      controlsAreaRef.current.addEventListener( 'touchmove', preventTouchMove, { passive: false });
    }

    return () => {
      bookReadyRef.current = false;
      reader.view = null;

      if (controlsAreaRef.current) {
        controlsAreaRef.current.removeEventListener('touchmove', preventTouchMove);
      }
    };
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem(DARK_MODE_KEY, String(next));
      return next;
    });
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
      <IconButton
        id="dark-mode-toggle"
        onClick={toggleDarkMode}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        sx={{ visibility: tocVisible ? 'hidden' : 'visible' }}>
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
      <div
        id="render-area"
        ref={renderAreaRef}></div>
      <div id="controls-area" ref={controlsAreaRef}>
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
