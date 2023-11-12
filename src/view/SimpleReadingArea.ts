import { ReadingArea } from "../App";

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
<div style="position: relative; height: 100%">
  <div id="view"></div>
  <div id="menu">
    <button id="prev">Prev</button>
    <button id="next">Next</button>
    <button id="toc">Contents</button>
  </div>
</div>
`;

export default class SimpleReadingArea extends HTMLElement implements ReadingArea {
  view: HTMLElement;
  #nextButton: HTMLButtonElement;
  #prevButton: HTMLButtonElement;

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(template.content.cloneNode(true));

    this.view = this.shadowRoot.querySelector("#view");
    this.#nextButton = this.shadowRoot.querySelector("#next");
    this.#prevButton = this.shadowRoot.querySelector("#prev");
  }

  addOnNextListener(e: EventListener) {
    this.#nextButton.addEventListener("click", e);
  }

  addOnPrevListener(e: EventListener) {
    this.#prevButton.addEventListener("click", e);
  }
}

customElements.define('reading-area', SimpleReadingArea);
