import { Howl } from 'howler';
import { AudioPlayer, Sound, SentenceCompleteEvent } from "app/AudioPlayer";

export default class HowlerPlayer extends EventTarget implements AudioPlayer {
  #sound: Howl;
  #q: Sound[];

  constructor() {
    super();
    this.#q = [];
  }

  enqueue(ss: Sound[]) {
    this.#q = this.#q.concat(ss);
  }

  play() {
    if (this.#q.length === 0) return;

    const thisSound =this.#q.shift();
    this.#sound = new Howl({
      src: [this.#bufToUrl(thisSound.data)],
      format: "wav",
    });

    this.#sound.play();
    this.#sound.once("end", () => {
      this.dispatchEvent(new SentenceCompleteEvent(thisSound.id));
      this.play();
    });
  }

  #bufToUrl(b: ArrayBuffer) {
    const blob = new Blob([b], { type: "audio/wav" });
    return URL.createObjectURL(blob);
  }

  stop() {}
}
