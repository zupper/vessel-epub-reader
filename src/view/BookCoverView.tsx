import React from 'react';
import { BookCover } from 'app/Book';

export type BookCoverViewParams = {
  cover: BookCover;
  onOpen: (id: string) => unknown;
}

export const BookCoverView = (params: BookCoverViewParams) => {
  return (
    <div className="book-cover">
      {params.cover.title}
      <button onClick={() => params.onOpen(params.cover.id)}>Read</button>
      <button>Options</button>
    </div>
  )
};
