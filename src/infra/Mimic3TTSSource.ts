import { TTSSource } from "app/TTSSource";

export default class Mimic3TTSSource implements TTSSource {
  #ttsEndpoint: string;

  constructor(apiUrl: string) {
    this.#ttsEndpoint = `${apiUrl}/tts?voice=en_US%2Fvctk_low%23s5&noiseScale=0.333&noiseW=0.333&lengthScale=1.4&ssml=false&audioTarget=client&text=`;
  }

  generate(ss: string[]) {
    return Promise.all(ss.map(s => this.#fetchSentence(s)));
  }

  async #fetchSentence(s: string) {
    const res = await fetch(this.#ttsEndpoint + s);
    const contentType = res.headers.get('content-type');
    if (!contentType || contentType !== 'audio/wav') {
      throw new Error('incorrect content type encountered during generation');
    }

    return (await res.blob()).arrayBuffer();
  }
}
