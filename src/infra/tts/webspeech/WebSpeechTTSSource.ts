import { Sentence } from "app/Book";
import { TTSSource, SentenceCompleteEvent, VoiceOption } from "app/tts/TTSSource";

export default class WebSpeechTTSSource extends EventTarget implements TTSSource {
  #synth: SpeechSynthesis;
  #utterance: SpeechSynthesisUtterance;
  #currentSentence: Sentence | null;
  #sentenceCompleted: boolean;
  #rate: number;
  #voiceURI: string | null;

  constructor() {
    super();
    if (!window.speechSynthesis) throw new Error('Web Speech APIs not available');
    this.#synth = window.speechSynthesis;
    this.#currentSentence = null;
    this.#sentenceCompleted = false;
    this.#rate = 1.0;
    this.#voiceURI = null;
  }

  id() { return 'webtts'; }
  load(_: Sentence[]) {}
  append(_: Sentence[]) {}
  prepend(_: Sentence[]) {}

  setRate(rate: number) {
    this.#rate = Math.max(0.1, Math.min(10, rate));
  }

  setVoice(uri: string) {
    this.#voiceURI = uri;
  }

  async getAvailableVoices(): Promise<VoiceOption[]> {
    let voices = this.#synth.getVoices();

    // Voices may load async — wait for them if empty
    if (voices.length === 0) {
      voices = await new Promise<SpeechSynthesisVoice[]>(resolve => {
        const handler = () => {
          this.#synth.removeEventListener('voiceschanged', handler);
          resolve(this.#synth.getVoices());
        };
        this.#synth.addEventListener('voiceschanged', handler);
        // Timeout fallback — some browsers never fire voiceschanged
        setTimeout(() => {
          this.#synth.removeEventListener('voiceschanged', handler);
          resolve(this.#synth.getVoices());
        }, 1000);
      });
    }

    // Filter to user's language prefix (e.g., 'en')
    const langPrefix = navigator.language.split('-')[0];
    const filtered = voices.filter(v => v.lang.startsWith(langPrefix));

    // Fall back to all voices if nothing matches
    const list = filtered.length > 0 ? filtered : voices;
    return list.map(v => ({ id: v.voiceURI, name: v.name }));
  }

  async prepare(s: Sentence) {
    const wasSpeaking = this.#synth.speaking || this.#synth.pending;
    this.stop();
    this.#currentSentence = s;
    this.#sentenceCompleted = false;
    this.#utterance = new SpeechSynthesisUtterance(s.text);
    this.#utterance.rate = this.#rate;

    if (this.#voiceURI) {
      const voices = this.#synth.getVoices();
      const match = voices.find(v => v.voiceURI === this.#voiceURI);
      if (match) this.#utterance.voice = match;
    }

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
    if (!this.#utterance?.onend && this.#currentSentence) {
      await this.prepare(this.#currentSentence);
    }
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
    // synth.pause() is a no-op on many platforms (e.g. Android).
    // Cancel speech for immediate silence; resume will re-speak the sentence.
    if (this.#utterance) this.#utterance.onend = null;
    this.#synth.cancel();
  }

  stop() {
    if (this.#utterance) this.#utterance.onend = null;
    this.#synth.cancel();
    this.#utterance = null;
    this.#currentSentence = null;
  }
}
