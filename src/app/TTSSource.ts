import { Sound } from "app/AudioPlayer";
import { Sentence } from "app/Book";

export interface TTSSource {
  generate: (ss: Sentence[]) => Promise<Sound[]>;
}
