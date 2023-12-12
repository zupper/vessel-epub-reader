import { Sentence } from "app/Book";
import { Sound } from "app/AudioPlayer";
import { TTSSource } from "./TTSSource";

const INITIAL_BUFFER_SIZE = 5;
const ONGOING_PRE_BUFFER_COUNT = 2;

export type SoundCacheConstructorParams = {
  ttsSource: TTSSource;
  sentences: Sentence[];
};

export default class SoundCache {
  #tts: TTSSource;
  #sentences: Sentence[];
  #sentencesMap: Map<string, Sentence>;
  #buffer: Map<string, Sound>;
  #bufferedOffset: number;

  constructor(params: SoundCacheConstructorParams) {
    this.#tts = params.ttsSource;
    this.#sentencesMap = new Map(params.sentences.map(s => [s.id, s]));
    this.#sentences = params.sentences;
    this.#buffer = new Map();
    this.#bufferedOffset = 0;
  }

  async get(id: string): Promise<Sound> {
    const sentence = this.#sentencesMap.get(id);
    if (!sentence) throw new Error('asking for sentence id that has not been enqueued');

    if (this.#buffer.size === 0) await this.#bufferSounds(INITIAL_BUFFER_SIZE);

    let sound = this.#buffer.get(id);
    if (!sound) {
      sound = (await this.#tts.generate([sentence]))[0];
      this.#buffer.set(id, sound);
    }

    this.#bufferSounds(ONGOING_PRE_BUFFER_COUNT);

    return sound;
  }

  append(ss: Sentence[]) {
    this.#sentences.push(...ss)
    ss.forEach(s => this.#sentencesMap.set(s.id, s));
  }

  prepend(ss: Sentence[]) {
    this.#sentences.unshift(...ss);
    ss.forEach(s => this.#sentencesMap.set(s.id, s));
    this.#bufferedOffset += ss.length;
  }

  async #bufferSounds(count: number) {
    const startIdx = this.#bufferedOffset;
    const endIdx = Math.min(this.#bufferedOffset + count, this.#sentences.length);;

    if (startIdx === endIdx) return;

    const buf = await this.#tts.generate(this.#sentences.slice(startIdx, endIdx));
    buf.forEach(s => this.#buffer.set(s.id, s));
    this.#bufferedOffset = endIdx;
  }
}
