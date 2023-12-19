import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';

import App from 'app/App';
import { BookCover } from 'app/Book';

import { BookCoverView } from './BookCoverView';

import { MainAppBar } from './MainAppBar';

import './LibraryView.css';

export type LibraryViewParams = {
  app: App;
}

export const LibraryView = (params: LibraryViewParams) => {
  const [covers, setCovers]= useState([] as BookCover[]);
  const navigate = useNavigate();

  const refreshBooks = useCallback(() => params.app.listBooks().then(bcs => setCovers(bcs)), []);
  const bookSelected = useCallback((id: string) => navigate('/read', { state: { bookId: id }}), []);
  const goToSettings = useCallback(() => navigate('/settings'), []);

  useEffect(() => { refreshBooks() }, []);

  return (
    <div id="library-container">
      <MainAppBar
        app={params.app}
        onBookAdded={refreshBooks}
        onSettingsClick={goToSettings}
      />
      { covers.length === 0 
          ? <p>No books!</p>
          : ( <Grid sx={{ marginTop: 1, marginBottom: 1 }} container justifyContent="center" spacing={3}>
                { covers.map((bc) => 
                    <Grid key={bc.id} item>
                      <BookCoverView
                        cover={bc}
                        key={bc.id}
                        onOpen={bookSelected} />
                  </Grid>
                ) }
              </Grid>
          )
      }
    </div>
  );
};
