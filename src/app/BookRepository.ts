import { Book, BookCover } from "./Book";

export default interface BookRepository {
  add: (b: Book) => Promise<void>;
  list: () => Promise<BookCover[]>;
  get: (id: string) => Promise<Book>;
}
