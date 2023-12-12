import React from 'react';

import { ToCItem } from 'app/Book';

import { ToCItemView } from './ToCItemView';

import './TableOfContentsView.css';

export type TableOfContentsViewParams = {
  toc: ToCItem[];
  onClose: () => unknown;
  onItemClick: (i: ToCItem) => unknown;
};

export const TableOfContentsView = (params: TableOfContentsViewParams) => {
  if (!params.toc) return null;

  return (
    <div id="table-of-contents">
      <div id="blackout" className='is-blacked-out'></div>
      <div 
        id="popup-view"
        className='is--visible'
        data-popup-modal="one">
        <div id="contents-heading">

        </div>
        <div onClick={params.onClose} id="popup-view__close">✕</div>
        <h1 className="font-weight-bold">
          Contents
        </h1>
        <div id="contents-scroller">
          <ul>
            {params.toc.map(i => <ToCItemView item={i} onClick={params.onItemClick} />) }
          </ul>
        </div>
      </div>
    </div>
  );
};
