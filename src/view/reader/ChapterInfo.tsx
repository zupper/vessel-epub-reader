import { ToCItem, ChapterProgress } from 'app/Book';
import React, {useState} from 'react';

import './ChapterInfo.css';

export type ChapterInfoParams = {
  chapter: ToCItem;
  chapterProgress: ChapterProgress;
};

export const ChapterInfo = (params: ChapterInfoParams) => {
  const [showPercentage, setShowPercentage] = useState(false);
  const toggle = () => setShowPercentage(!showPercentage);

  const percentage = params.chapterProgress?.bookPercentage;
  const percentageString = percentage ? `${Math.round(percentage)}%` : '';

  const totalPages = params.chapterProgress?.totalPages ?? 0;
  const currentPage = params.chapterProgress?.currentPage ?? 0;
  const chapterPagesLeft = totalPages - currentPage;
  const pagesString = chapterPagesLeft ? `${chapterPagesLeft} chapter pages left` : percentageString;

  return (
    <div id="chapter-info">
      <div id="chapter-info-name">{params.chapter?.label ?? ''}</div>
      <div id="chapter-info-progress" onClick={toggle}>{showPercentage ? percentageString : pagesString}</div>
    </div>
  );
};
