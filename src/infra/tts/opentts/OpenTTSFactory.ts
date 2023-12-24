import { TTSSourceFactory, TTSSourceConfig } from "app/tts/TTSSource";
import OpenTTSSource from "./OpenTTSSource";

export default class OpenTTSFactory implements TTSSourceFactory {
  id() {
    return 'opentts';
  }

  defaultConfig() {
    return Promise.resolve({
      apiUrl: {
        value: 'http://192.168.1.10:59125/api',
        type: 'URL',
      }
    });
  }

  validate(config: TTSSourceConfig) {
    try { 
      new URL(config.apiUrl.value);
      return true;
    }
    catch (e) {
      return false;
    }
  }

  make(config: TTSSourceConfig) {
    if (!this.validate(config)) throw new Error('invalid config');

    return new OpenTTSSource(config.apiUrl.value);
  }
}
