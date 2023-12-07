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

    return texts.map(t => JSON.parse(t)).map(({ cover }) => cover);
  }

  async get(id: string): Promise<Book> {
    const opfsRoot = await navigator.storage.getDirectory();
    const [dataHandle, metaHandle] = await Promise.all([
      opfsRoot.getFileHandle(id),
      opfsRoot.getFileHandle(`${id}.meta`),
    ]);

    const [dataFile, metaFile] = await Promise.all([
      dataHandle.getFile(),
      metaHandle.getFile(),
    ]);

    const meta = JSON.parse(await metaFile.text());
    const data = await dataFile.arrayBuffer();
    return {
      cover: meta.cover,
      toc: meta.toc,
      data,
    };
  }
}
