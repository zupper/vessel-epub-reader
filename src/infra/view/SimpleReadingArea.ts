import { ToCItem, Book } from "app/Book";
import App from "app/App";
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
    <button id="open">Open</button>
    <button id="prev">Prev</button>
    <button id="next">Next</button>
    <button id="toc-button">Contents</button>
    <button id="audio-button-play">Play Audio</button>
    <button id="audio-button-stop">Stop Audio</button>
  </div>
</div>
`;

export default class SimpleReadingArea extends HTMLElement {
  view: HTMLElement;
  #app: App;
  #book: Book;
  #wrapper: HTMLElement;
  #openButton: HTMLButtonElement;
  #nextButton: HTMLButtonElement;
  #prevButton: HTMLButtonElement;
  #contentsButton: HTMLButtonElement;
  #tableOfContents: TableOfContents;
  #playButton: HTMLButtonElement;
  #stopButton: HTMLButtonElement;

  constructor(app: App) {
    super();
    this.#app = app;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(template.content.cloneNode(true));

    this.view = this.shadowRoot.querySelector("#view");
    this.#wrapper = this.shadowRoot.querySelector("#wrapper");
    this.#openButton = this.shadowRoot.querySelector("#open");
    this.#nextButton = this.shadowRoot.querySelector("#next");
    this.#prevButton = this.shadowRoot.querySelector("#prev");
    this.#contentsButton = this.shadowRoot.querySelector("#toc-button");
    this.#playButton = this.shadowRoot.querySelector("#audio-button-play");
    this.#stopButton = this.shadowRoot.querySelector("#audio-button-stop");
  }

  connectedCallback() {
    this.#openButton.addEventListener("click", () => this.openBook());
    this.#nextButton.addEventListener("click", () => this.#app.moveTo("next"));
    this.#prevButton.addEventListener("click", () => this.#app.moveTo("prev"));
    this.#contentsButton.addEventListener("click", () => this.toggleContents());
    this.#playButton.addEventListener("click", () => this.#app.ttsControl.startReading());
    this.#stopButton.addEventListener("click", () => this.#app.ttsControl.stopReading());
  }

  async openBook() {
    this.#book = await this.#app.openBook("https://s3.amazonaws.com/moby-dick/moby-dick.epub");
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
}

customElements.define('reading-area', SimpleReadingArea);
