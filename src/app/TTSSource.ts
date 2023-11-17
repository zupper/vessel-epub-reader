import { Sound } from "app/AudioPlayer";

export interface TTSSource {
  generate: (ss: string[]) => Promise<Sound[]>;
}
