import React from 'react';

import { ToCItem } from 'app/Book';

export type ToCItemViewParams = {
  item: ToCItem;
  onClick: (i: ToCItem) => unknown;
}

export const ToCItemView = (params: ToCItemViewParams) => {
  return (
    <li>
      <a href="#" onClick={(e) => { e.preventDefault(); params.onClick(params.item) } }>{params.item.label}</a>
      { params.item.subitems.length > 0
        ? <ul className='subitems'>{ params.item.subitems.map(i => <ToCItemView item={i} onClick={params.onClick} />) }</ul>
        : '' }
    </li>
  )
};
