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
    <button id="prev">Prev</button>
    <button id="next">Next</button>
    <button id="toc-button">Contents</button>
    <button id="audio-button-play">Play Audio</button>
    <button id="audio-button-pause">Pause Audio</button>
    <button id="audio-button-resume">Resume Audio</button>
    <button id="audio-button-stop">Stop Audio</button>
    <button id="audio-button-next">Audio Next</button>
    <button id="audio-button-prev">Audio Prev</button>
  </div>
</div>
`;

export default class SimpleReadingArea extends HTMLElement {
  view: HTMLElement;
  #app: App;
  #book: Book;
  #wrapper: HTMLElement;
  #nextButton: HTMLButtonElement;
  #prevButton: HTMLButtonElement;
  #contentsButton: HTMLButtonElement;
  #tableOfContents: TableOfContents;
  #playButton: HTMLButtonElement;
  #pauseButton: HTMLButtonElement;
  #resumeButton: HTMLButtonElement;
  #stopButton: HTMLButtonElement;
  #audioNextButton: HTMLButtonElement;
  #audioPrevButton: HTMLButtonElement;

  constructor(app: App) {
    super();
    this.#app = app;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(template.content.cloneNode(true));

    this.view = this.shadowRoot.querySelector("#view");
    this.#wrapper = this.shadowRoot.querySelector("#wrapper");
    this.#nextButton = this.shadowRoot.querySelector("#next");
    this.#prevButton = this.shadowRoot.querySelector("#prev");
    this.#contentsButton = this.shadowRoot.querySelector("#toc-button");
    this.#playButton = this.shadowRoot.querySelector("#audio-button-play");
    this.#pauseButton = this.shadowRoot.querySelector("#audio-button-pause");
    this.#resumeButton = this.shadowRoot.querySelector("#audio-button-resume");
    this.#stopButton = this.shadowRoot.querySelector("#audio-button-stop");
    this.#audioNextButton = this.shadowRoot.querySelector("#audio-button-next");
    this.#audioPrevButton = this.shadowRoot.querySelector("#audio-button-prev");
  }

  connectedCallback() {
    this.#nextButton.addEventListener("click", () => this.#app.nav.nextPage());
    this.#prevButton.addEventListener("click", () => this.#app.nav.prevPage());
    this.#contentsButton.addEventListener("click", () => this.toggleContents());
    this.#playButton.addEventListener("click", () => this.#app.tts.startReading());
    this.#pauseButton.addEventListener("click", () => this.#app.tts.pauseReading());
    this.#resumeButton.addEventListener("click", () => this.#app.tts.resumeReading());
    this.#stopButton.addEventListener("click", () => this.#app.tts.stopReading());
    this.#audioNextButton.addEventListener("click", () => this.#app.tts.nextSentence());
    this.#audioPrevButton.addEventListener("click", () => this.#app.tts.previousSentence());
  }

  toggleContents() {
    if (!this.#book) {
      throw new Error('Must provide Book first');
    }

    if (!this.#tableOfContents) {
      this.#tableOfContents = new TableOfContents(
        this.#book.cover.title,
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
    this.#app.nav.moveTo(i.link);
  }
}

customElements.define('reading-area', SimpleReadingArea);
