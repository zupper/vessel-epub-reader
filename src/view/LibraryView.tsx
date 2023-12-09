import React, { useCallback, useEffect, useState } from 'react';

import App from 'app/App';
import { BookCover } from 'app/Book';

import { BookCoverView } from './BookCoverView';
import { AddBookView } from './AddBookView';

export type LibraryViewParams = {
  app: App;
}

export const LibraryView = (params: LibraryViewParams) => {
  const [covers, setCovers]= useState([] as BookCover[]);

  const refreshBooks = useCallback(() => params.app.listBooks().then(bcs => setCovers(bcs)), []);
  const bookSelected = useCallback((id: string) => console.log('book selected', id), []);

  useEffect(() => { refreshBooks() }, []);

  return (
    <div id="library-container">
      <p>Library component</p>
      <AddBookView app={params.app} onBookAdded={refreshBooks}  />
      { covers.length === 0 
          ? <p>No books!</p>
          : ( <div id="books-list">
                { covers.map((bc) => 
                    <BookCoverView
                      cover={bc}
                      key={bc.id}
                      onOpen={bookSelected} />) }
              </div> )
      }
    </div>
  );
};
