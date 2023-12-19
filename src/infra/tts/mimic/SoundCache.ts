import { Sentence } from "app/Book";
import { Sound } from "./HowlerPlayer";
import SoundSource from "./SoundSource";

const ONGOING_PRE_BUFFER_COUNT = 2;

export type SoundCacheConstructorParams = {
  soundSource: SoundSource;
  sentences: Sentence[];
};

export default class SoundCache {
  #source: SoundSource;
  #sentences: Sentence[];
  #sentencesMap: Map<string, Sentence>;
  #buffer: Map<string, Sound>;

  constructor(params: SoundCacheConstructorParams) {
    this.#source = params.soundSource;
    this.#sentencesMap = new Map(params.sentences.map(s => [s.id, s]));
    this.#sentences = params.sentences;
    this.#buffer = new Map();
  }

  async get(s: Sentence): Promise<Sound> {
    if (!this.#sentences.find(sx => sx.id === s.id)) {
      console.error('Asking for sentence that has not been enqueued');
      console.log('Requested sentences', s);
      console.log('Enqueued sentences', this.#sentences);
    }

    let sound = this.#buffer.get(s.id);
    if (!sound) {
      sound = (await this.#source.generate([s]))[0];
      this.#buffer.set(s.id, sound);
    }

    this.#bufferSounds(this.#findSoundsForBuffering(s.id));

    return sound;
  }

  #findSoundsForBuffering(id: string) {
    const centerIndex = this.#sentences.findIndex(s => s.id === id);
    const forwardResults = this.#forwardSearch(centerIndex, 2);
    const backwardResults = this.#backwardSearch(centerIndex, 1);

    return [...backwardResults, ...forwardResults].slice(0, ONGOING_PRE_BUFFER_COUNT);
  }

  #forwardSearch(idx: number, count: number) {
    const result = [];

    for (let i = 1; idx + i < this.#sentences.length && result.length < count; i++) {
      if (!this.#buffer.has(this.#sentences[idx + i].id)) result.push(i + idx);
    }

    return result;
  }

  #backwardSearch(idx: number, count: number) {
    const result = [];

    // if the buuffer has the previous two sentences, then skip backwards buffering
    if (idx >= 2 && this.#buffer.has(this.#sentences[idx - 1].id) && this.#buffer.has(this.#sentences[idx - 2].id)) {
      return [];
    }

    for (let i = 1; idx - i >= 0 && result.length < count; i++) {
      if (!this.#buffer.has(this.#sentences[idx - i].id)) result.push(idx - i);
    }

    return result;
  }

  append(ss: Sentence[]) {
    ss.forEach(s => {
      if (!this.#sentencesMap.has(s.id)) {
        this.#sentences.push(s);
        this.#sentencesMap.set(s.id, s);
      }
    })
  }

  prepend(ss: Sentence[]) {
    ss.forEach(s => {
      if (!this.#sentencesMap.has(s.id)) {
        this.#sentences.unshift(s);
        this.#sentencesMap.set(s.id, s);
      }
    });
  }

  async #bufferSounds(iis: number[]) {
    if (iis.length === 0) return;

    const buf = await this.#source.generate(iis.map(idx => this.#sentences[idx]));
    buf.forEach(s => this.#buffer.set(s.id, s));
  }
}
