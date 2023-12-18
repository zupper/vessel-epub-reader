import React from 'react';

import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea, CardActions, Button } from '@mui/material';

import { BookCover } from 'app/Book';

export type BookCoverViewParams = {
  cover: BookCover;
  onOpen: (id: string) => unknown;
}

export const BookCoverView = (params: BookCoverViewParams) => {
  return (
    <Card sx={{ maxWidth: 345, height: "100%" }}>
      <CardActionArea onClick={() => params.onOpen(params.cover.id)}>
        <CardMedia
          sx={{ height: 250, padding: 1 }}
          image="/static/images/cards/contemplative-reptile.jpg"
          title="green iguana"
        >
          <Typography gutterBottom variant="h5" component="div">
            {params.cover.title}
          </Typography>
        </CardMedia>
      </CardActionArea>
      <CardActions>
        <Button size="small">DELETE</Button>
      </CardActions>
    </Card>
  )
};
