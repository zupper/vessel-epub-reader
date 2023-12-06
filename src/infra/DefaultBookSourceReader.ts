import BookSourceReader from "app/BookSourceReader";

export default class DefaultBookSourceReader implements BookSourceReader {
  readFile(f: File): Promise<ArrayBuffer> {
    return new Promise((res) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(f);
      reader.onload = () => res(reader.result as ArrayBuffer);
    });
  }
  readURL(u: URL) { return Promise.resolve(null); }
}
