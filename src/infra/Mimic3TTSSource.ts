import { TTSSource } from "app/TTSSource";
import * as murmurhash from "murmurhash";

const zip = <A, B>(arr1: A[], arr2: B[]): [A, B][] => arr1.map((val, i) => [val, arr2[i]]);

export default class Mimic3TTSSource implements TTSSource {
  #ttsEndpoint: string;

  constructor(apiUrl: string) {
    this.#ttsEndpoint = `${apiUrl}/tts?voice=en_UK%2Fapope_low%23default&noiseScale=0.667&noiseW=0.8&lengthScale=1.1&ssml=false&audioTarget=client&text=`;
  }

  async generate(ss: string[]) {
    const hashes = ss.map(this.#getHash);
    const sounds = await Promise.all(ss.map(s => this.#fetchSentence(s)));
    console.log('hashes', hashes);
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

  #getHash(s: string) {
    return murmurhash.v3(s).toString();
  }

  #toSound([h, d]: [string, ArrayBuffer]) {
    return { id: h, data: d };
  }
}
