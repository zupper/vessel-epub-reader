import { TTSSource, TTSSourceConfig, TTSSourceProvider, TTSSourceFactory  } from "app/tts/TTSSource";
import LocalStringStorage from "infra/LocalStringStorage";

const ACTIVE_SOURCE_KEY = 'DefaultBookSourceReader-activeSource';
const SOURCE_CONFIG_KEY = 'DefaultBookSourceReader-sourceConfig-';

export default class DefaultTTSSourceProvider implements TTSSourceProvider {
  #factories: TTSSourceFactory[];
  #activeSource: string;

  #stringStorage: LocalStringStorage;

  constructor(factories: TTSSourceFactory[]) {
    this.#factories = factories;
    this.#stringStorage = new LocalStringStorage();
    this.#activeSource = this.#stringStorage.get(ACTIVE_SOURCE_KEY) ?? this.#factories[0].id();
  }

  getSources(): string[] {
    return this.#factories.map(f => f.id());
  }

  getActiveSource(): TTSSource {
    const factory = this.#factories.find(f => f.id() === this.#activeSource);
    if (factory) {
      return factory.make(this.getConfig(factory.id()));
    }

    return null;
  }

  activateSource(id: string): void {
    if (!this.getSources().includes(id)) throw new Error('Unsupported TTSSource.');

    this.#stringStorage.set(ACTIVE_SOURCE_KEY, id);
    this.#activeSource = id;
  }

  getConfig(id: string): TTSSourceConfig {
    const config: TTSSourceConfig = JSON.parse(this.#stringStorage.get(`${SOURCE_CONFIG_KEY}${id}`));
    return config ?? this.#factories.find(f => f.id() === id)?.defaultConfig();
  }

  setConfig(id: string, config: TTSSourceConfig): void {
    if (!this.#factories.find(f => f.id() === id)?.validate(config)) throw new Error('invalid config');
    this.#stringStorage.set(`${SOURCE_CONFIG_KEY}${id}`, JSON.stringify(config));
  }
}
