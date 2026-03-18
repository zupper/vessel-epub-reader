import { Sentence } from "app/Book";
import { TTSSource, SentenceCompleteEvent } from "app/tts/TTSSource";
import HowlerPlayer from "../opentts/HowlerPlayer";
import AudioConverter from "../supertonic/AudioConverter";

export default class GenericONNXSource
  extends EventTarget
  implements TTSSource
{
  #pipeline: any;
  #pipelineReady: Promise<void>;
  #player: HowlerPlayer;
  #modelUrl: string;
  #speed: number;
  #sentences: Sentence[] = [];

  constructor(modelUrl: string, speed: number = 1.0) {
    super();
    this.#modelUrl = modelUrl;
    this.#speed = speed;
    this.#player = new HowlerPlayer(this.#onSentenceEnd.bind(this));
    this.#pipelineReady = this.#initPipeline();
  }

  id(): string {
    return "onnx";
  }

  async #initPipeline(): Promise<void> {
    const { pipeline } = await import("@huggingface/transformers");
    this.#pipeline = await pipeline("text-to-speech", this.#modelUrl);
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
