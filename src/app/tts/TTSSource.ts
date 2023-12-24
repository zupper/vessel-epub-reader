import { Sentence } from "app/Book";

export class SentenceCompleteEvent extends Event {
  sentenceId: string;

  constructor(sentenceId: string) {
    super('sentencecomplete', { bubbles: true, cancelable: false });
    this.sentenceId = sentenceId;
  }
}

export interface TTSSource extends EventTarget {
  id: () => string;
  prepare: (s: Sentence) => Promise<void>;
  load: (ss: Sentence[]) => void;
  append: (ss: Sentence[]) => void;
  prepend: (ss: Sentence[]) => void;
  play: (s?: Sentence) => Promise<void>;
  stop: () => void;
  pause: () => void;
}

export type TTSSourceConfig = {
  [key: string]: {
    value: string;
    type: string;
    options?: string[];
  }
};

export interface TTSSourceProvider {
  getSources(): string[];
  getConfig(id: string): Promise<TTSSourceConfig>;
  setConfig(id: string, config: TTSSourceConfig): void;
  activateSource(id: string): void;
  getActiveSource(): Promise<TTSSource>;
}

export interface TTSSourceFactory {
  id(): string;
  make(config: TTSSourceConfig): TTSSource;
  validate(config: TTSSourceConfig): boolean;
  defaultConfig(): Promise<TTSSourceConfig>;
}
