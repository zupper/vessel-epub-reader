import React from 'react';

import Typography from '@mui/material/Typography';
import { CardActionArea, CardActions, Button, Box, bottomNavigationClasses } from '@mui/material';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import Paper from '@mui/material/Paper';

import { BookCover } from 'app/Book';

import './BookCoverView.css';

export type BookCoverViewParams = {
  cover: BookCover;
  onOpen: (id: string) => unknown;
}

export const BookCoverView = (params: BookCoverViewParams) => {
  return (
    <Paper
      className='book-cover-view'
      onClick={() => params.onOpen(params.cover.id)}
      elevation={3}
      sx={{
        width: 250,
        height: 400,
        backgroundColor: (theme) =>
        theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        position: 'relative',
        "&:hover": {
          boxShadow: 10
        }
      }}
    >
      <img src={params.cover.coverImageUrl} alt="" />
      <Box
        display={'flex'}
        flexDirection={'row'}
        justifyContent={'space-between'}
        sx={{
          width: '100%',
          minHeight: 50,
          position: 'absolute',
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.85);',
        }}
      >
        <Box
          display={'flex'}
          flexDirection={'column'}
          flexGrow={1}
          padding={'3px'}
          paddingLeft={'15px'}
        >
          <Typography variant='subtitle2'>
            {params.cover.title}
          </Typography>
          <Typography variant='caption'>Author Name</Typography>
        </Box>

        <IconButton onClick={(e) => { e.stopPropagation(); console.log('kur'); } }><MoreVertIcon /></IconButton>
      </Box>
    </Paper>
  )
};
