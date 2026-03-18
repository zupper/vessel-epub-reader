import { TTSSourceFactory, TTSSourceConfig } from "app/tts/TTSSource";
import GenericONNXSource from "./GenericONNXSource";

export default class GenericONNXFactory implements TTSSourceFactory {
  id() {
    return "onnx";
  }

  async defaultConfig(): Promise<TTSSourceConfig> {
    return {
      modelUrl: {
        value: "",
        type: "string",
      },
      speed: {
        value: "1.0",
        type: "number",
      },
    };
  }

  validate(config: TTSSourceConfig): boolean {
    if (!config.modelUrl?.value || config.modelUrl.value.trim() === "") {
      return false;
    }

    const speed = parseFloat(config.speed.value);
    if (isNaN(speed) || speed < 0.5 || speed > 2.0) {
      return false;
    }

    return true;
  }

  make(config: TTSSourceConfig): GenericONNXSource {
    if (!this.validate(config)) {
      throw new Error(
        "invalid config: modelUrl required and speed must be 0.5-2.0",
      );
    }

    return new GenericONNXSource(
      config.modelUrl.value,
      parseFloat(config.speed.value),
    );
  }
}
