import { BookReader } from "app/BookReader";
import { Book, BookLocation, PageRef } from "app/Book";
import StringStorage from "app/StringStorage";

export const BOOK_LOCATION_CHANGED_EVENT = "booklocationchanged";

export class BookLocationChangedEvent extends Event {
  location: BookLocation;

  constructor(loc: BookLocation) {
    super(BOOK_LOCATION_CHANGED_EVENT, { bubbles: true, cancelable: false });
    this.location = loc;
  }
}

export type NavigationConstructorParams = {
  reader: BookReader;
  storage: StringStorage;
};

export default class Navigation extends EventTarget {
  book: Book;
  #reader: BookReader;
  #storage: StringStorage;

  constructor(params: NavigationConstructorParams) {
    super();
    this.#reader = params.reader;
    this.#storage = params.storage;
  }

  async moveToLastReadPage() {
    if (this.#lastPageRef) {
      return this.moveTo(this.#lastPageRef);
    }
  }

  async nextPage() {
    return this.moveTo('next');
  }

  async prevPage() {
    return this.moveTo('prev');
  }

  async moveTo(ref: PageRef): Promise<BookLocation> {
    if (!this.book) {
      throw new Error('Must open book first');
    }

    const loc = ref === "next" ? await this.#reader.nextPage() :
                ref === "prev" ? await this.#reader.prevPage() :
                                 await this.#reader.moveTo(ref);

    this.#lastPageRef = loc.ref;
    this.dispatchEvent(new BookLocationChangedEvent(loc));

    return loc;
  }

  set #lastPageRef(ref: PageRef) {
    this.#storage.set(this.#getPageRefKey(), ref);
  }

  get #lastPageRef(): PageRef {
    return this.#storage.get(this.#getPageRefKey());
  }

  #getPageRefKey() {
    return (`"${this.book.cover.title}":lastPageRef`);
  }
}
