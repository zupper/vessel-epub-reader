import { Sentence } from "app/Book";

export class SentenceCompleteEvent extends Event {
  sentenceId: string;

  constructor(sentenceId: string) {
    super('sentencecomplete', { bubbles: true, cancelable: false });
    this.sentenceId = sentenceId;
  }
}

export interface TTSSource extends EventTarget {
  prepare: (s: Sentence) => Promise<void>;
  load: (ss: Sentence[]) => void;
  append: (ss: Sentence[]) => void;
  prepend: (ss: Sentence[]) => void;
  play: (s?: Sentence) => Promise<void>;
  stop: () => void;
  pause: () => void;
}
