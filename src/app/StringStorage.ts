export default interface StringStorage {
  set: (key: string, value: string) => void;
  get: (key: string) => string;
}

