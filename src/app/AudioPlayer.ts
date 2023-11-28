export type Sound = {
  id: string;
  data: ArrayBuffer;
}

export class SentenceCompleteEvent extends Event {
  sentenceId: string;
  nextSentenceId: string;

  constructor(sentenceId: string, nextSentenceId: string) {
    super('sentencecomplete', { bubbles: true, cancelable: false });
    this.sentenceId = sentenceId;
    this.nextSentenceId = nextSentenceId;
  }
}

export interface AudioPlayer extends EventTarget {
  play: () => void;
  enqueue: (ss: Sound[]) => void;
  clearQueue: () => void;
  stop: () => void;
}
