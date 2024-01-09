import { Sentence } from "app/Book";
import { TTSSource, SentenceCompleteEvent } from "app/tts/TTSSource";
import SoundSource, { SoundSourceParams } from "./SoundSource";
import SoundCache from "./SoundCache";
import HowlerPlayer from "./HowlerPlayer";

export default class OpenTTSSource extends EventTarget implements TTSSource {
  #cache: SoundCache;
  #player: HowlerPlayer;
  #sourceParams: SoundSourceParams;

  constructor(apiUrl: string, username?: string, password?: string) {
    super();

    this.#sourceParams = { apiUrl, username, password };
    this.#player = new HowlerPlayer(this.#onSentenceEnd.bind(this));
  }

  id() {
    return 'opentts';
  }

  #onSentenceEnd(sentenceId: string) {
    this.dispatchEvent(new SentenceCompleteEvent(sentenceId));
  }

  load(ss: Sentence[]) {
    this.#cache = new SoundCache({
      soundSource: new SoundSource(this.#sourceParams),
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
