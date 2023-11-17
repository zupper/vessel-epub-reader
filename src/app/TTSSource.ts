export interface TTSSource {
  generate: (ss: string[]) => Promise<ArrayBuffer[]>;
}
