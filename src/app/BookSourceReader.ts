
export default interface BookSourceReader {
  readFile: (f: File) => Promise<ArrayBuffer>;
  readURL: (u: URL) => Promise<ArrayBuffer>;
}
