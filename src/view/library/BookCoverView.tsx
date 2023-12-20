import React from 'react';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton  from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';

import Paper from '@mui/material/Paper';

import { BookCover } from 'app/Book';

import './BookCoverView.css';

export type BookCoverViewParams = {
  cover: BookCover;
  onOpen: (id: string) => unknown;
  onDelete: (id: string) => unknown;
}

export const BookCoverView = (params: BookCoverViewParams) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClose = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(null);
  };

  const handleDelete = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    handleClose(e);
    params.onDelete(params.cover.id);
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };


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
        alignItems={'center'}
        sx={{
          width: '100%',
            minHeight: 70,
            position: 'absolute',
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.85);',
        }}
      >
        <Typography padding={'5px'} variant='subtitle1'>
          {params.cover.title}
        </Typography>
        <IconButton onClick={openMenu}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="book-settings-menu"
          aria-labelledby="book-settings-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Paper>
  )
};
