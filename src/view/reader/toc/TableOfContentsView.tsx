import React, { useEffect, useRef } from 'react';

import { ToCItem, ToC } from 'app/Book';

import { ToCItemView } from './ToCItemView';

import './TableOfContentsView.css';

export type TableOfContentsViewParams = {
  toc: ToC;
  currentChapter?: ToCItem;
  onClose: () => unknown;
  onItemClick: (i: ToCItem) => unknown;
};

export const TableOfContentsView = (params: TableOfContentsViewParams) => {
  if (!params.toc) return null;

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  }, [scrollRef.current]);


  const formatSubitems = (is: ToCItem[]) =>
    is?.map(i =>
      <ToCItemView
        key={i.link}
        item={i}
        scrollToRef={scrollRef}
        active={i.link === params.currentChapter?.link}
        formatSubitems={formatSubitems}
        onClick={params.onItemClick} />
    );

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
            { formatSubitems(params.toc.items) }
          </ul>
        </div>
      </div>
    </div>
  );
};
