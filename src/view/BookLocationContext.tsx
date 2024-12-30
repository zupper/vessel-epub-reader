import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BookLocation, isBookLocation } from 'app/Book';
import App from 'app/App';
import { BOOK_LOCATION_CHANGED_EVENT, BookLocationChangedEvent } from 'app/Navigation';

type BookLocationContextType = BookLocation | null;

type BookLocationProviderProps = {
  children: ReactNode;
  app: App;
};

const BookLocationContext = createContext<BookLocationContextType>(null);

export const BookLocationProvider: React.FC<BookLocationProviderProps> = ({ app, children }) => {
  const [data, setData] = useState<BookLocation | null>(null); // Replace `string | null` with your actual type

  useEffect(() => {
    function updateData(event: BookLocationChangedEvent) {
      const loc = event.location;
      if (isBookLocation(loc)) {
        setData(loc);
      }
    }

    app.nav.addEventListener(BOOK_LOCATION_CHANGED_EVENT, updateData);

    return () => {
      app.nav.removeEventListener(BOOK_LOCATION_CHANGED_EVENT, updateData);
    };
  }, []);

  return (
    <BookLocationContext.Provider value={data}>
      {children}
    </BookLocationContext.Provider>
  );
};

// Hook for consuming the context
export const useBookLocationContext = (): BookLocationContextType => useContext(BookLocationContext);
