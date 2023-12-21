import { TTSSourceFactory, TTSSourceConfig } from "app/tts/TTSSource";
import WebSpeechTTSSource from "./WebSpeechTTSSource";

export default class WebSpeechTTSFactory implements TTSSourceFactory {
  id() { return 'webtts'; }

  defaultConfig(): TTSSourceConfig {
   return {};
  }

  validate(_: TTSSourceConfig): boolean {
    return true;
  }

  make(_: TTSSourceConfig) {
    return new WebSpeechTTSSource();
  }
}
