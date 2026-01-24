import { TTSSourceFactory, TTSSourceConfig } from "app/tts/TTSSource";
import SupertonicTTSSource from "./SupertonicTTSSource";

export default class SupertonicTTSFactory implements TTSSourceFactory {
  id() {
    return "supertonic";
  }

  async defaultConfig(): Promise<TTSSourceConfig> {
    return {
      voice: {
        value: "F1",
        type: "enum",
        options: ["F1", "F2", "F3", "F4", "F5", "M1", "M2", "M3", "M4", "M5"],
      },
      speed: {
        value: "1.0",
        type: "number",
      },
    };
  }

  validate(config: TTSSourceConfig): boolean {
    const validVoices = [
      "F1",
      "F2",
      "F3",
      "F4",
      "F5",
      "M1",
      "M2",
      "M3",
      "M4",
      "M5",
    ];

    if (!validVoices.includes(config.voice.value)) {
      return false;
    }

    const speed = parseFloat(config.speed.value);
    if (isNaN(speed) || speed < 0.5 || speed > 2.0) {
      return false;
    }

    return true;
  }

  make(config: TTSSourceConfig): SupertonicTTSSource {
    if (!this.validate(config)) {
      throw new Error("invalid config");
    }

    return new SupertonicTTSSource(
      config.voice.value,
      parseFloat(config.speed.value),
    );
  }
}
