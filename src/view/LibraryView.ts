import { BookCover } from "app/Book";
import App from "app/App";

export default class LibraryView {

  #app: App;
  #openButton: HTMLButtonElement;
  #libraryView: HTMLElement;
  #fileInput: HTMLInputElement;

  constructor(app: App) {

    this.#app = app;
    this.#libraryView = document.querySelector('#library');
    this.#openButton = document.querySelector('#openfile');
    this.#fileInput = document.querySelector('#fileInput');

    this.#openButton.addEventListener('click', this.#openFile.bind(this));
    this.#fileInput.addEventListener('change', this.#handleFileSelection.bind(this));

    this.#listFiles().then(this.#displayList.bind(this));
  }

  #openFile() {
    this.#fileInput.click();
  }

  #listFiles() {
    return this.#app.listBooks();
  }

  #displayList(bcs: BookCover[]) {
    const ul = document.createElement('ul');
    const lis = bcs.map(bc => {
      const li = document.createElement('li');
      li.appendChild(this.#makeLink(bc));
      return li;
    });

    ul.append(...lis);
    this.#libraryView.appendChild(ul);
  }

  #makeLink(bc: BookCover) {
    const a = document.createElement('a');
    a.href = '#';
    a.appendChild(document.createTextNode(bc.title));
    a.addEventListener("click", (e) => {
      e.preventDefault();
      this.#app.openBook(bc.id);
    });
    return a;
  }

  async #handleFileSelection(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const file = inputElement.files[0];
    await this.#app.addBook(file);

    console.log(await this.#app.listBooks());
  }
}
