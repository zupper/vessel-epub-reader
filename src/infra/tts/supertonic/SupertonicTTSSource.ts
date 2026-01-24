import { Sentence } from "app/Book";
import { TTSSource, SentenceCompleteEvent } from "app/tts/TTSSource";
import HowlerPlayer from "../opentts/HowlerPlayer";
import AudioConverter from "./AudioConverter";
import VoiceManager from "./VoiceManager";

export default class SupertonicTTSSource
  extends EventTarget
  implements TTSSource
{
  #pipeline: any;
  #pipelineReady: Promise<void>;
  #player: HowlerPlayer;
  #voiceManager: VoiceManager;
  #currentVoice: Float32Array | null = null;
  #speed: number;
  #voiceId: string;
  #sentences: Sentence[] = [];

  constructor(voiceId: string, speed: number = 1.0) {
    super();
    this.#voiceId = voiceId;
    this.#speed = speed;
    this.#voiceManager = new VoiceManager();
    this.#player = new HowlerPlayer(this.#onSentenceEnd.bind(this));
    this.#pipelineReady = this.#initPipeline();
  }

  id(): string {
    return "supertonic";
  }

  async #initPipeline(): Promise<void> {
    const { pipeline } = await import("@xenova/transformers");
    this.#pipeline = await pipeline(
      "text-to-speech",
      "onnx-community/Supertonic-TTS-ONNX",
    );
    this.#currentVoice = await this.#voiceManager.loadVoice(this.#voiceId);
  }

  async #ensureReady(): Promise<void> {
    await this.#pipelineReady;
  }

  #onSentenceEnd(sentenceId: string): void {
    this.dispatchEvent(new SentenceCompleteEvent(sentenceId));
  }

  async prepare(s: Sentence): Promise<void> {
    await this.#ensureReady();

    const { audio, sampling_rate } = await this.#pipeline(s.text, {
      speaker_embeddings: this.#currentVoice,
      speed: this.#speed,
    });

    const wavBuffer = AudioConverter.convertToWav(audio, sampling_rate);

    this.#player.stop();
    this.#player.load({ id: s.id, data: wavBuffer });
  }

  load(ss: Sentence[]): void {
    this.#sentences = [...ss];
  }

  append(ss: Sentence[]): void {
    this.#sentences.push(...ss);
  }

  prepend(ss: Sentence[]): void {
    this.#sentences.unshift(...ss);
  }

  async play(s?: Sentence): Promise<void> {
    if (s) {
      await this.prepare(s);
    }
    this.#player.play();
  }

  stop(): void {
    this.#player.stop();
  }

  pause(): void {
    this.#player.pause();
  }
}
