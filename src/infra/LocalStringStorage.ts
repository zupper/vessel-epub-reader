import StringStorage from "app/StringStorage";

export default class LocalStringStorage implements StringStorage {
    set(key: string, value: string) { localStorage.setItem(key, value); }
    get(key: string) { return localStorage.getItem(key); }
}
