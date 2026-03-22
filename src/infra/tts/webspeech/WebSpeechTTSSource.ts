import { Sentence } from "app/Book";
import { TTSSource, SentenceCompleteEvent } from "app/tts/TTSSource";

export default class WebSpeechTTSSource extends EventTarget implements TTSSource {
  #synth: SpeechSynthesis;
  #utterance: SpeechSynthesisUtterance;
  #sentenceCompleted: boolean;

  constructor() {
    super();
    if (!window.speechSynthesis) throw new Error('Web Speech APIs not available');
    this.#synth = window.speechSynthesis;
    this.#sentenceCompleted = false;
  }

  id() { return 'webtts'; }
  load(_: Sentence[]) {}
  append(_: Sentence[]) {}
  prepend(_: Sentence[]) {}

  async prepare(s: Sentence) {
    const wasSpeaking = this.#synth.speaking || this.#synth.pending;
    this.stop();
    this.#sentenceCompleted = false;
    this.#utterance = new SpeechSynthesisUtterance(s.text);
    this.#utterance.onend = () => {
      this.#sentenceCompleted = true;
      this.dispatchEvent(new SentenceCompleteEvent(s.id));
    };

    if (wasSpeaking) {
      await this.#waitForIdle();
    }
  }

  async play(s?: Sentence) {
    if (s) await this.prepare(s);
    await this.#speakWithRetry();
  }

  async #speakWithRetry(retries = 2): Promise<void> {
    if (!this.#utterance) throw new Error('No utterance prepared');
    this.#synth.speak(this.#utterance);
    await new Promise(r => setTimeout(r, 250));

    if (!this.#synth.speaking && !this.#synth.pending && !this.#sentenceCompleted && retries > 0) {
      this.#synth.cancel();
      await this.#waitForIdle();
      return this.#speakWithRetry(retries - 1);
    }
  }

  async #waitForIdle(): Promise<void> {
    const deadline = Date.now() + 500;
    await new Promise(r => setTimeout(r, 50));
    while ((this.#synth.speaking || this.#synth.pending) && Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 10));
    }
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
