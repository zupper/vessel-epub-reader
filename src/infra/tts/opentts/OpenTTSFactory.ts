import { TTSSourceFactory, TTSSourceConfig } from "app/tts/TTSSource";
import OpenTTSSource from "./OpenTTSSource";

export default class OpenTTSFactory implements TTSSourceFactory {
  id() {
    return 'opentts';
  }

  defaultConfig() {
    return Promise.resolve({
      apiUrl: {
        value: 'http://localhost:59125/api',
        type: 'URL',
      },
      authType: {
        value: 'None',
        type: 'enum',
        options: ['None', 'Basic']
      },
      username: {
        value: null,
        type: 'string',
      },
      password: {
        value: null,
        type: 'string',
      },
    });
  }

  validate(config: TTSSourceConfig) {
    try { 
      new URL(config.apiUrl.value);
    }
    catch (e) {
      return false;
    }

    if (!['None', 'Basic'].includes(config.authType.value)) return false;

    if (config.authType.value === 'Basic') {
      const { username, password } = config;
      if (username.value === null || password.value === null) return false;
    }

    if (config.authType.value === 'None') {
      const { username, password } = config;
      if (username.value !== null || password.value !== null) return false;
    }

    return true;
  }

  make(config: TTSSourceConfig) {
    if (!this.validate(config)) throw new Error('invalid config');

    return new OpenTTSSource(config.apiUrl.value, config.username.value, config.password.value);
  }
}
