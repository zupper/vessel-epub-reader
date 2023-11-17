export type Sound = {
  id: string;
  data: ArrayBuffer;
}

export class SentenceCompleteEvent extends Event {
  sentenceId: string;

  constructor(sentenceId: string) {
    super('sentencecomplete', { bubbles: true, cancelable: false });
    this.sentenceId = sentenceId;
  }
}

export interface AudioPlayer extends EventTarget {
  play: () => void;
  enqueue: (ss: Sound[]) => void;
  stop: () => void;
}
