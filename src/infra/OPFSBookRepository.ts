import { Book, BookCover } from "app/Book";
import BookRepository from "app/BookRepository";

export default class OPFSBookRepository implements BookRepository {
  async add(b: Book) {
    const opfsRoot = await navigator.storage.getDirectory();
    const fileHandle = await opfsRoot.getFileHandle(b.cover.id, { create: true });

    // the below ignore is caused by https://github.com/microsoft/TypeScript/issues/47568
    // should be removed when the above is fixed
    // @ts-ignore
    const writable = await fileHandle.createWritable();
    await writable.write(b.data);
    await writable.close();

    //TODO: write the book cover info somewhere, probably in a meta file or something
  }

  async list(): Promise<BookCover[]> { return []; }
  async get(bc: BookCover): Promise<Book> {
    const opfsRoot = await navigator.storage.getDirectory();
    //
    // the below ignore is caused by https://github.com/microsoft/TypeScript/issues/47568
    // should be removed when the above is fixed
    // @ts-ignore
    for await (let [name, handle] of opfsRoot) {
      if (name === bc.id) {

        const file: File = await handle.getFile();
        console.log(name);
        console.log('url', URL.createObjectURL(file))
      }
    }

    return null;
  }
}
