import { Sentence } from "app/Book";

export default class PlaybackQueue {
  #q: Sentence[];
  #current: number;

  constructor(ss: Sentence[]) {
    this.#q = ss;
    this.#current = 0;
  }

  current() {
    if (this.#q.length) return this.#q[this.#current];
    return null;
  }

  next() {
    if (this.#current + 1 >= this.#q.length) return null;
    return this.#q[++this.#current];
  }

  hasNext() {
    return (this.#current + 1 < this.#q.length);
  }

  prev() {
    if (this.#current - 1 < 0) return null;
    return this.#q[--this.#current];
  }

  enqueue(ss: Sentence[]) {
    this.#q.push(...ss);
  }

  last() {
    if (this.#q.length === 0) return null;
    return this.#q[this.#q.length - 1];
  }
}

