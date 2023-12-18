import React, { ChangeEvent, useRef } from 'react';
import Button from '@mui/material/Button';

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

  return (
      <Button onClick={showFileSelector} color="inherit">
        Add Book
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange} 
          style={{ display: "none" }} />
      </Button>
  );
};
