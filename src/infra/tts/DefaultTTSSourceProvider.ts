import { TTSSource } from "app/tts/TTSSource";
import { TTSSourceConfig, TTSSourceProvider } from "app/tts/TTSSourceProvider";
import LocalStringStorage from "infra/LocalStringStorage";
import Mimic3TTSSource from "./mimic/Mimic3TTSSource";
import WebSpeechTTSSource from "./WebSpeechTTSSource";

const ACTIVE_SOURCE_KEY = 'DefaultBookSourceReader-activeSource';

export default class DefaultTTSSourceProvider implements TTSSourceProvider {
  #activeSource: string;
  #mimicApiUrl: string;

  #stringStorage: LocalStringStorage;

  constructor() {
    this.#mimicApiUrl = 'http://192.168.1.10:59125/api'

    this.#stringStorage = new LocalStringStorage();
    this.#activeSource = this.#stringStorage.get(ACTIVE_SOURCE_KEY) ?? 'webtts';
  }

  getSources(): string[] {
    return ['mimic3', 'webtts'];
  }

  getActiveSource(): TTSSource {
    return this.#activeSource === 'mimic3' ? new Mimic3TTSSource(this.#mimicApiUrl) :
           this.#activeSource === 'webtts' ? new WebSpeechTTSSource()               : null;
  }

  activateSource(id: string): void {
    if (!this.getSources().includes(id)) throw new Error('Unsupported TTSSource.');

    this.#stringStorage.set(ACTIVE_SOURCE_KEY, id);
    this.#activeSource = id;
  }

  getConfig(id: string): TTSSourceConfig {
    throw new Error('not implemented');
  }

  setConfig(id: string, config: TTSSourceConfig): void {
    throw new Error('not implemented');
  }
}
