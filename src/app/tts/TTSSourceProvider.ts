import { TTSSource } from "./TTSSource";

export type TTSSourceConfig = { [key: string]: string };

export interface TTSSourceProvider {
  getSources(): string[];
  getConfig(id: string): TTSSourceConfig;
  setConfig(id: string, config: TTSSourceConfig): void;
  activateSource(id: string): void;
  getActiveSource(): TTSSource;
}
