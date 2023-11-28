import { Howl } from 'howler';
import { AudioPlayer, Sound, SentenceCompleteEvent  } from "app/AudioPlayer";

export default class HowlerPlayer extends EventTarget implements AudioPlayer {
  #sound: Howl;

  play(s: Sound) {
    this.#sound = new Howl({
      src: [this.#bufToUrl(s.data)],
      format: "wav",
    });

    this.#sound.play();
    this.#sound.once("end", () => this.dispatchEvent(new SentenceCompleteEvent(s.id)));
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
}
