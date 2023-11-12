import { Book, BookReader, ReadingArea, PageRef, ToCItem } from "./App";
import * as ePubjs from "epubjs";

export default class EpubjsBookReader implements BookReader {
  book: ePubjs.Book;
  rendition: ePubjs.Rendition;

  constructor() {
    this.book = new ePubjs.Book();
  }

  open(filename: string): Promise<Book> {
    this.book.open(filename);
    return Promise.all([
      this.book.opened,
      this.book.loaded.navigation,
    ])
    .then(([opened, nav]) => ({
      title: opened.packaging.metadata.title,
      toc: nav.toc.map(this.#toTocItem),
    }));
  }

  #toTocItem = (navItem: ePubjs.NavItem):ToCItem => ({
    link: navItem.href,
    label: navItem.label.trim(),
    subitems: navItem.subitems.map(this.#toTocItem),
  });

  render(el: ReadingArea) {
    this.rendition = this.book.renderTo(el.view as Element, { width: "100%", height: "90%" });
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
    return this.book.loaded;
  }

  get currentCfi() {
    return this.rendition.location.start.cfi;
  }

  moveTo(ref: PageRef) {
    this.rendition.display(ref);
  }
}

