import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';

import App from 'app/App';
import { ToCItem } from 'app/Book';
import {
  ThemeId, getTheme, getThemeVars,
  FontSize, getNextFontSize, getPrevFontSize,
  FontFamilyId, getNextFontFamily, getPrevFontFamily,
  TtsSpeed, getNextTtsSpeed, getPrevTtsSpeed,
} from 'app/ReaderTheme';
import { VoiceOption } from 'app/tts/TTSSource';
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
  const [ttsRate, setTtsRate] = useState<TtsSpeed>(() => params.app.ttsRate);
  const [ttsVoice, setTtsVoice] = useState<string>(() => params.app.ttsVoice);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
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
    params.app.tts.getAvailableVoices().then(setAvailableVoices);
    params.app.tts.setRate(params.app.ttsRate);
    if (params.app.ttsVoice) params.app.tts.setVoice(params.app.ttsVoice);
  }, []);

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

  const increaseTtsRate = useCallback(() => {
    setTtsRate(prev => {
      const next = getNextTtsSpeed(prev);
      if (!next) return prev;
      params.app.setTtsRate(next);
      return next;
    });
  }, []);

  const decreaseTtsRate = useCallback(() => {
    setTtsRate(prev => {
      const next = getPrevTtsSpeed(prev);
      if (!next) return prev;
      params.app.setTtsRate(next);
      return next;
    });
  }, []);

  const selectTtsVoice = useCallback((id: string) => {
    setTtsVoice(id);
    params.app.setTtsVoice(id);
  }, []);

  const nextTtsVoice = useCallback(() => {
    setTtsVoice(prev => {
      const idx = availableVoices.findIndex(v => v.id === prev);
      const next = availableVoices[(idx + 1) % availableVoices.length];
      if (next) params.app.setTtsVoice(next.id);
      return next?.id ?? prev;
    });
  }, [availableVoices]);

  const prevTtsVoice = useCallback(() => {
    setTtsVoice(prev => {
      const idx = availableVoices.findIndex(v => v.id === prev);
      const next = availableVoices[(idx - 1 + availableVoices.length) % availableVoices.length];
      if (next) params.app.setTtsVoice(next.id);
      return next?.id ?? prev;
    });
  }, [availableVoices]);

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
        onPrevFontFamily={prevFontFamily}
        ttsRate={ttsRate}
        onIncreaseTtsRate={increaseTtsRate}
        onDecreaseTtsRate={decreaseTtsRate}
        ttsVoice={ttsVoice}
        availableVoices={availableVoices}
        onNextTtsVoice={nextTtsVoice}
        onPrevTtsVoice={prevTtsVoice}
        onSelectTtsVoice={selectTtsVoice}>
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
