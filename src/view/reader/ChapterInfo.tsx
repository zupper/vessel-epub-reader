import { ToCItem } from 'app/Book';
import React from 'react';

import './ChapterInfo.css';

export type ChapterInfoParams = {
  chapter: ToCItem;
};

export const ChapterInfo = (params: ChapterInfoParams) => {

  return (
    <div id="chapter-info">{params.chapter?.label ?? ''}</div>
  );
};
