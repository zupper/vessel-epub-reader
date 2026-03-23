import React, { useCallback, useEffect, useRef, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ContrastIcon from '@mui/icons-material/Contrast';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { ThemeId, FontSize, FontFamilyId, FONT_SIZES, getTheme, getFontFamily } from 'app/ReaderTheme';

import './ControlsDrawer.css';

const SETTINGS_PANEL_HEIGHT = 160;
const SNAP_THRESHOLD = 0.3;

const preventTouchMove = (e: TouchEvent) => e.preventDefault();

const THEME_ICONS: Record<ThemeId, React.ReactElement> = {
  light: <WbSunnyIcon fontSize="small" />,
  sepia: <AutoStoriesIcon fontSize="small" />,
  forest: <EnergySavingsLeafIcon fontSize="small" />,
  'warm-night': <NightsStayIcon fontSize="small" />,
  slate: <DarkModeIcon fontSize="small" />,
  amoled: <ContrastIcon fontSize="small" />,
};

const THEME_ORDER: ThemeId[] = ['light', 'sepia', 'forest', 'warm-night', 'slate', 'amoled'];

export type ControlsDrawerProps = {
  themeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  fontSize: FontSize;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  fontFamilyId: FontFamilyId;
  onNextFontFamily: () => void;
  onPrevFontFamily: () => void;
  children: React.ReactNode;
};

export const ControlsDrawer = (params: ControlsDrawerProps) => {
  const [expanded, setExpanded] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const startYRef = useRef(0);
  const draggingRef = useRef(false);
  const expandedRef = useRef(false);
  const controlsContentRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    expandedRef.current = expanded;
  }, [expanded]);

  useEffect(() => {
    const el = controlsContentRef.current;
    if (el) {
      el.addEventListener('touchmove', preventTouchMove, { passive: false });
    }
    return () => {
      if (el) {
        el.removeEventListener('touchmove', preventTouchMove);
      }
    };
  }, []);

  const handleDragStart = useCallback((clientY: number) => {
    startYRef.current = clientY;
    draggingRef.current = true;
    setDragging(true);
  }, []);

  const handleDragMove = useCallback((clientY: number) => {
    if (!draggingRef.current) return;

    const delta = startYRef.current - clientY;

    if (expandedRef.current) {
      const offset = Math.max(0, Math.min(SETTINGS_PANEL_HEIGHT, SETTINGS_PANEL_HEIGHT + delta));
      setDragOffset(offset);
    } else {
      const offset = Math.max(0, Math.min(SETTINGS_PANEL_HEIGHT, delta));
      setDragOffset(offset);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);

    const threshold = SETTINGS_PANEL_HEIGHT * SNAP_THRESHOLD;

    if (expandedRef.current) {
      if (dragOffset < SETTINGS_PANEL_HEIGHT - threshold) {
        setExpanded(false);
        setDragOffset(0);
      } else {
        setDragOffset(SETTINGS_PANEL_HEIGHT);
      }
    } else {
      if (dragOffset > threshold) {
        setExpanded(true);
        setDragOffset(SETTINGS_PANEL_HEIGHT);
      } else {
        setDragOffset(0);
      }
    }
  }, [dragOffset]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  }, [handleDragStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    handleDragMove(e.touches[0].clientY);
  }, [handleDragMove]);

  const onTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);

    const onMouseMove = (ev: MouseEvent) => handleDragMove(ev.clientY);
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      queueMicrotask(() => handleDragEnd());
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [handleDragStart, handleDragMove, handleDragEnd]);

  const onHandleClick = useCallback(() => {
    if (draggingRef.current) return;
    const next = !expanded;
    setExpanded(next);
    setDragOffset(next ? SETTINGS_PANEL_HEIGHT : 0);
  }, [expanded]);

  const translateY = dragging ? dragOffset : (expanded ? SETTINGS_PANEL_HEIGHT : 0);
  const bgOpacity = SETTINGS_PANEL_HEIGHT > 0 ? translateY / SETTINGS_PANEL_HEIGHT : 0;
  const theme = getTheme(params.themeId);

  return (
    <div
      id="controls-drawer"
      ref={drawerRef}
      style={{
        transform: `translateY(-${translateY}px)`,
        backgroundColor: `color-mix(in srgb, ${theme.vars['--reader-bg-overlay']} ${Math.round(bgOpacity * 100)}%, transparent)`,
      }}
      className={dragging ? '' : 'controls-drawer-snap'}>

      <div
        id="drawer-handle"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onClick={onHandleClick}
        role="button"
        aria-label={expanded ? 'Collapse settings' : 'Expand settings'}
        tabIndex={0}>
        <div id="drawer-handle-pill" />
      </div>

      <div id="controls-content" ref={controlsContentRef}>
        {params.children}
      </div>

      <div id="drawer-settings-panel">
        <div className="settings-row" id="theme-row">
          <div className="theme-scroll">
            {THEME_ORDER.map(id => (
              <IconButton
                key={id}
                onClick={() => params.onSelectTheme(id)}
                aria-label={`Theme: ${getTheme(id).label}`}
                className={`drawer-setting-button theme-button ${id === params.themeId ? 'theme-active' : ''}`}
                size="small">
                {THEME_ICONS[id]}
              </IconButton>
            ))}
          </div>
        </div>

        <div className="settings-row" id="font-size-row">
          <IconButton
            onClick={params.onDecreaseFontSize}
            disabled={params.fontSize === FONT_SIZES[0]}
            aria-label="Decrease font size"
            className="drawer-setting-button"
            size="small">
            <RemoveIcon fontSize="small" />
          </IconButton>
          <div className="font-size-dots">
            {FONT_SIZES.map(size => (
              <span
                key={size}
                className={`size-dot ${size === params.fontSize ? 'size-dot-active' : ''}`} />
            ))}
          </div>
          <IconButton
            onClick={params.onIncreaseFontSize}
            disabled={params.fontSize === FONT_SIZES[FONT_SIZES.length - 1]}
            aria-label="Increase font size"
            className="drawer-setting-button"
            size="small">
            <AddIcon fontSize="small" />
          </IconButton>
        </div>

        <div className="settings-row" id="font-family-row">
          <IconButton
            onClick={params.onPrevFontFamily}
            aria-label="Previous font"
            className="drawer-setting-button"
            size="small">
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <span className="font-family-label">
            {getFontFamily(params.fontFamilyId).label}
          </span>
          <IconButton
            onClick={params.onNextFontFamily}
            aria-label="Next font"
            className="drawer-setting-button"
            size="small">
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};
