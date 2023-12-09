import React, { ChangeEvent, useRef } from 'react';

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
    <div id="add-book-view">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange} 
        style={{ display: "none" }} />
      <button onClick={showFileSelector}>Add book</button>
    </div>
  );
};
