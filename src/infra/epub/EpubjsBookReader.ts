import * as murmurhash from "murmurhash";
import * as ePubjs from "epubjs";
import { Book, PageRef, ToCItem } from "app/Book";
import { BookReader } from "app/BookReader";
import { getRange } from "./CFI";

export default class EpubjsBookReader implements BookReader {
  #book: Book;
  #view: Element;
  #epubjsBook: ePubjs.Book;
  #rendition: ePubjs.Rendition;
  #displayedCfiRange: string;

  constructor() {
    this.#epubjsBook = new ePubjs.Book();
  }

  set view(v: Element) {
    this.#view = v;
  }

  open(filename: string): Promise<Book> {
    this.#epubjsBook.open(filename);
    return Promise.all([
      this.#epubjsBook.opened,
      this.#epubjsBook.loaded.navigation,
    ])
    .then(([opened, nav]) => {
      this.#book = {
        title: opened.packaging.metadata.title,
        toc: nav.toc.map(this.#toTocItem),
      };
      return this.#book;
    });
  }

  #toTocItem = (navItem: ePubjs.NavItem):ToCItem => ({
    link: navItem.href,
    label: navItem.label.trim(),
    subitems: navItem.subitems.map(this.#toTocItem),
  });

  render() {
    if (!this.#view) {
      throw new Error('Must provide view first');
    }

    this.#rendition = this.#epubjsBook.renderTo(this.#view, { width: "100%", height: "90%" });
    this.#rendition.on("relocated", (l: ePubjs.Location) => {
      this.#displayedCfiRange = getRange(l.start.cfi, l.end.cfi);
    });
    this.#rendition.display();
  }

  nextPage(): Promise<PageRef> {
    return new Promise((res) => {
      this.#rendition.next();
      this.#rendition.on("relocated", () => res(this.currentCfi))
    });
  }

  prevPage(): Promise<PageRef> {
    return new Promise((res) => {
      this.#rendition.prev();
      this.#rendition.on("relocated", () => res(this.currentCfi))
    });
  }

  async getDisplayedSentences() {
    const range = await this.#epubjsBook.getRange(this.#displayedCfiRange);
    const nodes = this.walkRange(range);
    return nodes
      .map(n => n.textContent)
      .map((t, idx, ts) => {
        if (idx === 0) { return t.substring(range.startOffset, t.length); }
        if (idx === ts.length - 1) { return t.substring(0, range.endOffset); }
        return t;
      })
      .map(t => t.match(/[^\.!\?]+[\.!\?]*/g))
      .filter(t => t !== null)
      .flat()
      .map(s => s.trim())
      .filter(t => !!t)
      .map(t => this.#toSentence(t));
  }

  #toSentence(t: string) {
    return ({
      id: this.#getHash(t),
      text: t,
    });
  }

  walkRange(range: Range) {
    const root = range.commonAncestorContainer;
    const doc = root.ownerDocument;
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    const result = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (this.nodeWithinRange(node, range) && this.isTextNode(node)) {
        result.push(node);
      }
    }

    return result;
  }

  #getHash(s: string) {
    return murmurhash.v3(s).toString();
  }

  isTextNode(node: Node) {
    return node.nodeType === 3
  }

  nodeWithinRange(node: Node, range: Range) {
    const followingStart = (range.startContainer.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) > 0;
    const precedingEnd = (range.endContainer.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_PRECEDING) > 0;

    return (
      node === range.startContainer ||
      node === range.endContainer ||
      (followingStart && precedingEnd)
    );
  }

  get currentCfi() {
    return this.#rendition.location.start.cfi;
  }

  moveTo(ref: PageRef) {
    this.#rendition.display(ref);
  }
}
