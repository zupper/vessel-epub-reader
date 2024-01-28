import { ToCItem, ChapterProgress } from 'app/Book';
import React from 'react';

import './ChapterInfo.css';

export type ChapterInfoParams = {
  chapter: ToCItem;
  chapterProgress: ChapterProgress;
};

export const ChapterInfo = (params: ChapterInfoParams) => {

  const percentage = params.chapterProgress?.bookPercentage;
  const percentageString = percentage ? `${Math.round(percentage)}%` : '';
  return (
    <div id="chapter-info">
      <div id="chapter-info-name">{params.chapter?.label ?? ''}</div>
      <div id="chapter-info-progress">{percentageString}</div>
    </div>
  );
};
