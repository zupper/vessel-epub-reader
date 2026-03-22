import { Howl } from 'howler';

export type Sound = {
  id: string;
  data: ArrayBuffer;
}

export default class HowlerPlayer {
  #sound: Howl;
  #blobUrl: string | null;
  #sentenceEndCallback: (sentenceId: string) => unknown;

  constructor(onSentenceEnd: (sentenceId: string) => unknown) {
    this.#sentenceEndCallback = onSentenceEnd;
    this.#blobUrl = null;
  }

  load(s: Sound) {
    this.#revokeBlobUrl();
    this.#blobUrl = this.#bufToUrl(s.data);

    this.#sound = new Howl({
      src: [this.#blobUrl],
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
    this.#revokeBlobUrl();
  }

  #revokeBlobUrl() {
    if (this.#blobUrl) {
      URL.revokeObjectURL(this.#blobUrl);
      this.#blobUrl = null;
    }
  }

  pause() {
    if (this.#sound) {
      this.#sound.pause();
    }
  }
}
