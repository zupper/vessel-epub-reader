import App from "app/App";

export default class LibraryView {

  #app: App;
  #openButton: HTMLButtonElement;
  #listButton: HTMLButtonElement;
  #fileInput: HTMLInputElement;

  constructor(app: App) {

    this.#app = app;
    this.#openButton = document.querySelector('#openfile');
    this.#listButton = document.querySelector('#listfiles');
    this.#fileInput = document.querySelector('#fileInput');

    this.#openButton.addEventListener('click', this.#openFile.bind(this));
    this.#fileInput.addEventListener('change', this.#handleFileSelection.bind(this));
  }

  #openFile() {
    this.#fileInput.click();
  }

  #handleFileSelection(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const file = inputElement.files[0];
    this.#app.addBook(file);
  }
}
