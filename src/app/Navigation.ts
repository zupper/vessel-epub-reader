import { BookReader } from "app/BookReader";
import { Book, PageRef } from "app/Book";
import StringStorage from "app/StringStorage";

export type NavigationConstructorParams = {
  reader: BookReader;
  storage: StringStorage;
};

export default class Navigation {
  book: Book;
  #reader: BookReader;
  #storage: StringStorage;

  constructor(params: NavigationConstructorParams) {
    this.#reader = params.reader;
    this.#storage = params.storage;
  }

  moveToLastReadPage() {
    if (this.#lastPageRef) {
      this.#reader.moveTo(this.#lastPageRef);
    }
  }

  async nextPage() {
    await this.moveTo('next');
  }

  async prevPage() {
    await this.moveTo('prev');
  }

  async moveTo(ref: PageRef) {
    if (!this.book) {
      throw new Error('Must open book first');
    }

    if (ref === "next") { this.#lastPageRef = await this.#reader.nextPage(); }
    else if (ref === "prev") { this.#lastPageRef = await this.#reader.prevPage(); }
    else {
      this.#reader.moveTo(ref);
      this.#lastPageRef = ref;
    }
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
