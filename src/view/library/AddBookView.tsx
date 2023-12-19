import React, { ChangeEvent, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';

import App from 'app/App';

export type AddBookViewParams = {
  app: App;
  onBookAdded: () => unknown;
};

export const AddBookView = (params: AddBookViewParams) => {
  const fileInputRef = useRef(null);

  const showFileSelector = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];

    if (file) {
      await params.app.addBook(file);
      params.onBookAdded();
    }
  };

  const fileInput = (
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileChange}
      style={{ display: "none" }} />
  );

  return (
    <Box onClick={showFileSelector}>
      <Button
        sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}
        color="inherit">
        ADD BOOK
        {fileInput}
      </Button>
      <IconButton
        size="large"
        sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
        color="inherit">
        <AddIcon />
        {fileInput}
      </IconButton>
    </Box>
  );
};
