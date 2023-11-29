import { Howl } from 'howler';
import { AudioPlayer, Sound, SentenceCompleteEvent  } from "app/AudioPlayer";

export default class HowlerPlayer extends EventTarget implements AudioPlayer {
  #sound: Howl;

  play(s?: Sound) {
    if (!s && !this.#sound) throw new Error("can't resume without a previous sound");

    if (s) {
      this.#sound = new Howl({
        src: [this.#bufToUrl(s.data)],
        format: "wav",
      });

      this.#sound.once("end", () => this.dispatchEvent(new SentenceCompleteEvent(s.id)));
    }

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
