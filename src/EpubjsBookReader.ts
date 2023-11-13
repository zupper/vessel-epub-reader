import * as ePubjs from "epubjs";
import { Book, BookReader, ReadingArea, PageRef, ToCItem } from "./App";

export default class EpubjsBookReader implements BookReader {
  epubjsBook: ePubjs.Book;
  rendition: ePubjs.Rendition;
  book: Book;
  #readingArea: ReadingArea;

  constructor() {
    this.epubjsBook = new ePubjs.Book();
  }

  set readingArea(ra: ReadingArea) {
    this.#readingArea = ra;
  }

  open(filename: string): Promise<Book> {
    this.epubjsBook.open(filename);
    return Promise.all([
      this.epubjsBook.opened,
      this.epubjsBook.loaded.navigation,
    ])
    .then(([opened, nav]) => {
      this.book = {
        title: opened.packaging.metadata.title,
        toc: nav.toc.map(this.#toTocItem),
      };
      return this.book;
    });
  }

  #toTocItem = (navItem: ePubjs.NavItem):ToCItem => ({
    link: navItem.href,
    label: navItem.label.trim(),
    subitems: navItem.subitems.map(this.#toTocItem),
  });

  render() {
    if (!this.#readingArea) {
      throw new Error('Must provide ReadinArea first');
    }

    this.#readingArea.book = this.book;
    this.rendition = this.epubjsBook.renderTo(this.#readingArea.view as Element, { width: "100%", height: "90%" });
    this.rendition.display();
  }

  nextPage(): Promise<PageRef> {
    return new Promise((res) => {
      this.rendition.next();
      this.rendition.on("relocated", () => res(this.currentCfi))
    });
  }

  prevPage(): Promise<PageRef> {
    return new Promise((res) => {
      this.rendition.prev();
      this.rendition.on("relocated", () => res(this.currentCfi))
    });
  }

  loaded() {
    return this.epubjsBook.loaded;
  }

  get currentCfi() {
    return this.rendition.location.start.cfi;
  }

  moveTo(ref: PageRef) {
    this.rendition.display(ref);
  }
}

