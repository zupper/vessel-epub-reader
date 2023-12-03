import { Sentence } from "app/Book";
import { TTSSource } from "app/TTSSource";
import { Sound } from "app/AudioPlayer";

const INITIAL_BUFFER_SIZE = 5;
const ONGOING_PRE_BUFFER_COUNT = 2;

export type SoundSourceConstructorParams = {
  ttsSource: TTSSource;
  sentences: Sentence[];
};

export default class SoundSource {
  #tts: TTSSource;
  #sentences: Sentence[];
  #sentencesMap: Map<string, Sentence>;
  #buffer: Map<string, Sound>;
  #bufferedOffset: number;

  constructor(params: SoundSourceConstructorParams) {
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

  async #bufferSounds(count: number) {
    const startIdx = this.#bufferedOffset;
    const endIdx = this.#bufferedOffset + count;
    const buf = await this.#tts.generate(this.#sentences.slice(startIdx, endIdx));
    buf.forEach(s => this.#buffer.set(s.id, s));
    this.#bufferedOffset = endIdx;
  }
}
