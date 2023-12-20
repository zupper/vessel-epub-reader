import { Book, BookCover } from "app/Book";
import BookRepository from "app/BookRepository";

export default class OPFSBookRepository implements BookRepository {
  async add(b: Book) {
    await Promise.all([
      this.#writeFile(b.cover.id, b.data),
      this.#writeFile(`${b.cover.id}.meta`, (new TextEncoder()).encode(JSON.stringify({ cover: b.cover, toc: b.toc }))),
      this.#writeFile(`${b.cover.id}.cover`, await this.fetchArrayBuffer(b.cover.coverImageUrl)),
    ]);
  }

  async get(id: string): Promise<Book> {
    const [dataFile, metaFile] = await Promise.all([
      this.#getFile(id),
      this.#getFile(`${id}.meta`),
    ]);

    const meta = JSON.parse(await metaFile.text());
    const [data, coverImageUrl] = await Promise.all([
      dataFile.arrayBuffer(),
      this.#getCoverImageUrl(id),
    ])
    return {
      cover: { ...meta.cover, coverImageUrl },
      toc: meta.toc,
      data,
    };
  }

  async list(): Promise<BookCover[]> {
    const opfsRoot = await navigator.storage.getDirectory();
    const filePromises = [];
    // the below ignores are caused by https://github.com/microsoft/TypeScript/issues/47568
    // should be removed when the above is fixed
    // @ts-ignore
    for await (let [name, handle] of opfsRoot) {
      if (name.includes('meta')) filePromises.push(handle.getFile());
    }

    const files = await Promise.all(filePromises);
    const texts = await Promise.all(files.map(f => f.text()));

    const covers = texts.map(t => JSON.parse(t)).map(({ cover }) => cover);
    return Promise.all(covers.map(async c => ({...c, coverImageUrl: await this.#getCoverImageUrl(c.id) })));
  }

  async delete(id: string) {
    const opfsRoot = await navigator.storage.getDirectory();
    // the below ignores are caused by https://github.com/microsoft/TypeScript/issues/47568
    // should be removed when the above is fixed
    // @ts-ignore
    for await (let [name] of opfsRoot) {
      if (name.includes(id)) await opfsRoot.removeEntry(name)
    }
  }

  async #writeFile(name: string, data: ArrayBuffer) {
    const opfsRoot = await navigator.storage.getDirectory();
    const file = await opfsRoot.getFileHandle(name, { create: true });
    // the below ignores are caused by https://github.com/microsoft/TypeScript/issues/47568
    // should be removed when the above is fixed
    // @ts-ignore
    const fileWritable = await file.createWritable();
    await fileWritable.write(data);
    await fileWritable.close();
  }

  async fetchArrayBuffer(burl: string) {
    const data = await fetch(burl);
    return data.arrayBuffer();
  }

  async #getCoverImageUrl(id: string) {
    try {
      const opfsRoot = await navigator.storage.getDirectory();
      const coverHandle = await opfsRoot.getFileHandle(`${id}.cover`);
      const coverFile = await coverHandle.getFile();
      const imageData = await coverFile.arrayBuffer();
      return URL.createObjectURL(new Blob([imageData]));
    }
    catch (e) {
      console.error('could not load cover image');
      console.error(e);
    }
  }

  async #getFile(name: string) {
    const opfsRoot = await navigator.storage.getDirectory();
    const handle = await opfsRoot.getFileHandle(name);
    return handle.getFile();
  }
}
