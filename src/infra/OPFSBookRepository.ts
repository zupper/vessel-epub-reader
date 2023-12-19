import { Book, BookCover } from "app/Book";
import BookRepository from "app/BookRepository";

export default class OPFSBookRepository implements BookRepository {
  async add(b: Book) {
    const opfsRoot = await navigator.storage.getDirectory();
    const dataFile = await opfsRoot.getFileHandle(b.cover.id, { create: true });

    // the below ignores are caused by https://github.com/microsoft/TypeScript/issues/47568
    // should be removed when the above is fixed
    // @ts-ignore
    const dataWritable = await dataFile.createWritable();
    await dataWritable.write(b.data);
    await dataWritable.close();

    const metaFile = await opfsRoot.getFileHandle(`${b.cover.id}.meta`, { create: true });

    // @ts-ignore
    const metaWritable = await metaFile.createWritable();
    const encoder = new TextEncoder();
    const metaData = encoder.encode(JSON.stringify({ cover: b.cover, toc: b.toc }));
    await metaWritable.write(metaData);
    await metaWritable.close();

    const coverFile = await opfsRoot.getFileHandle(`${b.cover.id}.cover`, { create: true });
    // @ts-ignore
    const coverWritable = await coverFile.createWritable();
    const coverData = await this.fetchArrayBuffer(b.cover.coverImageUrl);
    await coverWritable.write(coverData);
    await coverWritable.close();
  }

  async fetchArrayBuffer(burl: string) {
    const data = await fetch(burl);
    return data.arrayBuffer();
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
    return Promise.all(covers.map(async c => ({...c, coverImageUrl: await this.getCoverImageUrl(c.id) })));
  }

  async getCoverImageUrl(id: string) {
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

  async get(id: string): Promise<Book> {
    const opfsRoot = await navigator.storage.getDirectory();
    const [dataHandle, metaHandle, coverHandle] = await Promise.all([
      opfsRoot.getFileHandle(id),
      opfsRoot.getFileHandle(`${id}.meta`),
      opfsRoot.getFileHandle(`${id}.cover`),
    ]);

    const [dataFile, metaFile, coverFile] = await Promise.all([
      dataHandle.getFile(),
      metaHandle.getFile(),
      coverHandle.getFile(),
    ]);

    const meta = JSON.parse(await metaFile.text());
    const data = await dataFile.arrayBuffer();
    const imageData = await coverFile.arrayBuffer();
    const coverImageUrl = URL.createObjectURL(new Blob([imageData]));
    return {
      cover: { ...meta.cover, coverImageUrl },
      toc: meta.toc,
      data,
    };
  }
}
