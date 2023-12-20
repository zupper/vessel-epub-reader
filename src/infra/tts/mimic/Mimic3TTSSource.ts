import { Sentence } from "app/Book";
import { TTSSource, SentenceCompleteEvent } from "app/tts/TTSSource";
import SoundSource from "./SoundSource";
import SoundCache from "./SoundCache";
import HowlerPlayer from "./HowlerPlayer";

export default class Mimic3TTSSource extends EventTarget implements TTSSource {
  #url: string;
  #cache: SoundCache;
  #player: HowlerPlayer;

  constructor(apiUrl: string) {
    super();

    this.#url = apiUrl;
    this.#player = new HowlerPlayer(this.#onSentenceEnd.bind(this));
  }

  id() {
    return 'mimic3';
  }

  #onSentenceEnd(sentenceId: string) {
    this.dispatchEvent(new SentenceCompleteEvent(sentenceId));
  }

  load(ss: Sentence[]) {
    this.#cache = new SoundCache({
      soundSource: new SoundSource(this.#url),
      sentences: ss
    });
  }

  async prepare(s: Sentence) {
    const sound = await this.#cache.get(s);
    this.#player.stop();
    this.#player.load(sound);
  }

  async play(s?: Sentence) {
    if (s) await this.prepare(s);
    this.#player.play();
  }
   
  append(ss: Sentence[]) { this.#cache.append(ss); }
  prepend(ss: Sentence[]) { this.#cache.prepend(ss); }
  stop() { this.#player.stop(); }
  pause() { this.#player.pause(); }
}
