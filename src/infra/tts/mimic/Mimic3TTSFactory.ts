import { TTSSourceFactory, TTSSourceConfig } from "app/tts/TTSSource";
import Mimic3TTSSource from "./Mimic3TTSSource";

export default class Mimic3TTSFactory implements TTSSourceFactory {
  id() {
    return 'mimic3';
  }

  defaultConfig() {
    return {
      apiUrl: {
        value: 'http://192.168.1.10:59125/api',
        type: 'URL',
      }
    };
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

    return new Mimic3TTSSource(config.apiUrl.value);
  }
}
