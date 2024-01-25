import React from 'react';

import { ToCItem } from 'app/Book';

export type ToCItemViewParams = {
  item: ToCItem;
  active: boolean;
  formatSubitems: (is: ToCItem[]) => React.ReactNode;
  scrollToRef: React.RefObject<HTMLAnchorElement>;
  onClick: (i: ToCItem) => unknown;
}

export const ToCItemView = (params: ToCItemViewParams) => {
  const activeClass = params.active ? 'active' : '';
  return (
    <li>
      <a
        href="#"
        className={activeClass}
        ref={params.active ? params.scrollToRef : null}
        onClick={(e) => { e.preventDefault(); params.onClick(params.item) } }
      >
        {params.item.label}
      </a>
      { params.item.subitems.length > 0
        ? <ul className='subitems'>{ params.formatSubitems(params.item.subitems) }</ul>
        : '' }
    </li>
  )
};
