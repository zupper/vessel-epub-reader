import { Sentence } from "app/Book";
import { TTSSource, SentenceCompleteEvent } from "app/tts/TTSSource";

export default class WebSpeechTTSSource extends EventTarget implements TTSSource {
  #synth: SpeechSynthesis;
  #utterance: SpeechSynthesisUtterance;

  constructor() {
    super();
    if (!window.speechSynthesis) throw new Error('Web Speech APIs not available');
    this.#synth = window.speechSynthesis;
  }

  load(_: Sentence[]) {}
  append(_: Sentence[]) {}
  prepend(_: Sentence[]) {}

  prepare(s: Sentence) {
    this.stop();
    this.#utterance = new SpeechSynthesisUtterance(s.text);
    this.#utterance.onend = () => this.dispatchEvent(new SentenceCompleteEvent(s.id));
    return Promise.resolve();
  }

  play(s?: Sentence) {
    if (s) this.prepare(s);
    this.#synth.speak(this.#utterance);
    return Promise.resolve();
  }

  pause() {
    this.#synth.pause();
  }

  stop() {
    if (this.#utterance) this.#utterance.onend = null;
    this.#synth.cancel();
    this.#utterance = null;
  }
}
