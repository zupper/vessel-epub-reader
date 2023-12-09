import React from 'react';
import { useLocation } from 'react-router-dom';

import App from 'app/App';

export type ReaderViewProps = {
  app: App;
};

export const ReaderView = (params: ReaderViewProps) => {
  const location = useLocation();
  console.log(location.state.bookId);
  return <p>Reader component</p>;
};
