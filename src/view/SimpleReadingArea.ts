import { ReadingArea, ToCItem, Book, App } from "../App";
import TableOfContents from "./TableOfContents";

const template = document.createElement('template');
template.innerHTML = `
<style>
reading-area {
  position: relative;
}

#view {
  height: 100%;
  width: 100%;
}

#menu {
  position: absolute;
  bottom: 0px;
}

</style>
<div
  id="wrapper"
  style="position: relative; height: 100%">
  <div id="view"></div>
  <div id="menu">
    <button id="prev">Prev</button>
    <button id="next">Next</button>
    <button id="toc-button">Contents</button>
  </div>
</div>
`;

export default class SimpleReadingArea extends HTMLElement implements ReadingArea {
  view: HTMLElement;
  #app: App;
  #book: Book;
  #wrapper: HTMLElement;
  #nextButton: HTMLButtonElement;
  #prevButton: HTMLButtonElement;
  #contentsButton: HTMLButtonElement;
  #tableOfContents: TableOfContents;

  constructor(app: App) {
    super();
    this.#app = app;
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(template.content.cloneNode(true));

    this.view = this.shadowRoot.querySelector("#view");
    this.#wrapper = this.shadowRoot.querySelector("#wrapper");
    this.#nextButton = this.shadowRoot.querySelector("#next");
    this.#prevButton = this.shadowRoot.querySelector("#prev");
    this.#contentsButton = this.shadowRoot.querySelector("#toc-button");

    this.#nextButton.addEventListener("click", () => this.#app.moveTo("next"));
    this.#prevButton.addEventListener("click", () => this.#app.moveTo("prev"));
    this.#contentsButton.addEventListener("click", () => this.toggleContents());
  }

  toggleContents() {
    if (!this.#book) {
      throw new Error('Must provide Book first');
    }

    if (!this.#tableOfContents) {
      this.#tableOfContents = new TableOfContents(
        this.#book.title,
        this.#book.toc,
        this.#onToCItemClick.bind(this)
      );
      this.#wrapper.appendChild(this.#tableOfContents);
    }

    if (this.#tableOfContents.isOpen) {
      this.#tableOfContents.closePopup();
    }
    else {
      this.#tableOfContents.openPopup();
    }
  }

  #onToCItemClick(i: ToCItem) {
    this.#app.moveTo(i.link);
  }

  set book(book: Book) {
    this.#book = book;
  }
}

customElements.define('reading-area', SimpleReadingArea);
