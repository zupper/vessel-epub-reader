import { ToCItem } from 'app/Book';

const template = document.createElement('template');
template.innerHTML = `
<style>
#blackout {
  position: absolute;
  z-index: 1010;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .65);
  display: none;
}

#blackout.is-blacked-out {
  display: block;
}

#popup-view {
  height: 80vh;
  overflow: scroll;
  width: 650px;
  background-color: #fff;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 45px;
  opacity: 0;
  pointer-events: none;
  transition: all 100ms ease-in-out;
  z-index: 1011;
  border-radius: 5px;
}

#popup-view.is--visible {
  opacity: 1;
  pointer-events: auto;
}

#popup-view__close {
  position: absolute;
  font-size: 1.2rem;
  right: -10px;
  top: -10px;
  cursor: pointer;
  color: grey;
}
</style>
<div id="blackout"></div>
<div 
  id="popup-view"
  data-popup-modal="one">
  <i id="popup-modal__close" class="fas fa-2x fa-times text-white bg-primary p-3"></i>
  <h1 class="font-weight-bold">
    Modal One Title
  </h1>
</div>
`;

export default class TableOfContents extends HTMLElement{
  isOpen: boolean;
  #title: string;
  #toc: ToCItem[];
  #tocView: HTMLElement;
  #popupView: HTMLElement;
  #blackout: HTMLElement;
  #callback: (i: ToCItem) => void;

  constructor(title: string, toc: ToCItem[], onItemSelected: (i: ToCItem) => void) {
    super();
    this.isOpen = false;
    this.#title = title;
    this.#toc = toc;
    this.#tocView = this.#toTocView(this.#toc);
    this.#callback = onItemSelected;
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(template.content.cloneNode(true));

    this.#popupView = this.shadowRoot.querySelector("#popup-view");
    this.#popupView
      .querySelector("#popup-modal__close")
      .addEventListener("clicl", () => this.closePopup());
    this.#popupView.querySelector("h1").innerText = this.#title ;
    this.#blackout = this.shadowRoot.querySelector("#blackout");
    this.#blackout.addEventListener("click", () => this.closePopup());
  }

  openPopup() {
    this.#popupView.appendChild(this.#tocView);
    this.#popupView.classList.add('is--visible')
    this.#blackout.classList.add('is-blacked-out')
    this.isOpen = true;
  }

  closePopup() {
    this.#popupView.classList.remove('is--visible')
    this.#blackout.classList.remove('is-blacked-out')
    this.isOpen = false;
  }

  #makeLink(i: ToCItem) {
    const a = document.createElement('a');
    a.href = i.link;
    a.appendChild(document.createTextNode(i.label));
    a.addEventListener("click", (e) => {
      e.preventDefault();
      this.#callback(i);
      this.closePopup();
    });
    return a;
  }

  #toTocItemView(i: ToCItem) {
    const iv = document.createElement('li');
    iv.appendChild(this.#makeLink(i));

    if (i.subitems.length > 0) {
      const sul = this.#toTocView(i.subitems)
      sul.classList.add('subitems');
      iv.appendChild(sul);
    }

    return iv;
  }

  #toTocView(is: ToCItem[]) {
    const ul = document.createElement('ul');
    ul.classList.add('toc-items');
    is
      .map(i => this.#toTocItemView(i))
      .forEach(iv => ul.appendChild(iv));
    return ul;
  }
}

customElements.define('table-of-contents', TableOfContents)
