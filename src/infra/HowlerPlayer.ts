import { Howl } from 'howler';
import { AudioPlayer } from "app/AudioPlayer";

export default class HowlerPlayer implements AudioPlayer {
  #sound: Howl;
  #q: ArrayBuffer[];

  constructor() {
    this.#q = [];
  }

  play(bs: ArrayBuffer[]) {
    this.#q = bs;
    this.#playLoop();
  }

  #playLoop() {
    if (this.#q.length === 0) return;

    this.#sound = new Howl({
      src: [this.#bufToUrl(this.#q.shift())],
      format: "wav",
    });

    this.#sound.play();

    this.#sound.once("end", () => this.#playLoop());
  }

  #bufToUrl(b: ArrayBuffer) {
    const blob = new Blob([b], { type: "audio/wav" });
    return URL.createObjectURL(blob);
  }

  stop() {}
}
