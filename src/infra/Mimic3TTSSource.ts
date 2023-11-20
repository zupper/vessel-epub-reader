import { Sentence } from "app/Book";
import { TTSSource } from "app/TTSSource";

const zip = <A, B>(arr1: A[], arr2: B[]): [A, B][] => arr1.map((val, i) => [val, arr2[i]]);

export default class Mimic3TTSSource implements TTSSource {
  #ttsEndpoint: string;

  constructor(apiUrl: string) {
    this.#ttsEndpoint = `${apiUrl}/tts?voice=en_UK%2Fapope_low%23default&noiseScale=0.667&noiseW=0.8&lengthScale=1.1&ssml=false&audioTarget=client&text=`;
  }

  async generate(ss: Sentence[]) {
    const hashes = ss.map(s => s.id);
    const sounds = await Promise.all(ss.map(s => this.#fetchSentence(s.text)));
    return zip(hashes, sounds).map(this.#toSound);
  }

  async #fetchSentence(s: string) {
    const res = await fetch(this.#ttsEndpoint + s);
    const contentType = res.headers.get('content-type');
    if (!contentType || contentType !== 'audio/wav') {
      throw new Error('incorrect content type encountered during generation');
    }

    return (await res.blob()).arrayBuffer();
  }

  #toSound([h, d]: [string, ArrayBuffer]) {
    return { id: h, data: d };
  }
}
