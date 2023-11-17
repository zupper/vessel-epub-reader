export interface AudioPlayer {
  play: (bs: ArrayBuffer[]) => void;
  stop: () => void;
}
