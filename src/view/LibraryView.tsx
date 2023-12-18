import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

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

  useEffect(() => { refreshBooks() }, []);

  return (
    <div id="library-container">
      <MainAppBar app={params.app} onBookAdded={refreshBooks} />
      { covers.length === 0 
          ? <p>No books!</p>
          : ( <Grid sx={{ marginTop: 1, marginBottom: 1 }} container justifyContent="center" spacing={3}>
                { covers.map((bc) => 
                    <Grid key={bc.id} item>
                      <Paper
                        sx={{
                          width: 250,
                          height: 300,
                          backgroundColor: (theme) =>
                          theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
                        }}
                      >
                        <BookCoverView
                          cover={bc}
                          key={bc.id}
                          onOpen={bookSelected} />
                      </Paper>
                  </Grid>
                ) }
              </Grid>
          )
      }
    </div>
  );
};
