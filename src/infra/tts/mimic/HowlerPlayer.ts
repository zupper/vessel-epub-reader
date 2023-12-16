import { Howl } from 'howler';

export type Sound = {
  id: string;
  data: ArrayBuffer;
}

export default class HowlerPlayer {
  #sound: Howl;
  #sentenceEndCallback: (sentenceId: string) => unknown;

  constructor(onSentenceEnd: (sentenceId: string) => unknown) {
    this.#sentenceEndCallback = onSentenceEnd;
  }

  load(s: Sound) {
    this.#sound = new Howl({
      src: [this.#bufToUrl(s.data)],
      format: "wav",
    });

    this.#sound.once("end", () => this.#sentenceEndCallback(s.id));
  }

  play(s?: Sound) {
    if (!s && !this.#sound) throw new Error("can't resume without a previous sound");

    if (s) this.load(s);
    this.#sound.play();
  }

  #bufToUrl(b: ArrayBuffer) {
    const blob = new Blob([b], { type: "audio/wav" });
    return URL.createObjectURL(blob);
  }

  stop() {
    if (this.#sound) {
      this.#sound.off('end');
      this.#sound.stop();
      this.#sound = null;
    }
  }

  pause() {
    if (this.#sound) {
      this.#sound.pause();
    }
  }
}
