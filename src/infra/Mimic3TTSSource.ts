import { Sentence } from "app/Book";
import { TTSSource } from "app/tts/TTSSource";

const zip = <A, B>(arr1: A[], arr2: B[]): [A, B][] => arr1.map((val, i) => [val, arr2[i]]);

const LANG = 'en_UK';
const VOICE = 'apope_low';
const SPEAKER = 'default';
const RATE = 0.8;
const AUDIO_VOLATILITY = 0.667;
const PHONEME_VOLATILITY = 0.8;

export default class Mimic3TTSSource implements TTSSource {
  #ttsEndpoint: string;

  constructor(apiUrl: string) {
    this.#ttsEndpoint = `${apiUrl}/tts?voice=${LANG}%2F${VOICE}%23${SPEAKER}&noiseScale=${AUDIO_VOLATILITY}&noiseW=${PHONEME_VOLATILITY}&lengthScale=${RATE}&ssml=false&audioTarget=client&text=`;
  }

  async generate(ss: Sentence[]) {
    const hashes = ss.map(s => s.id);

    // the model seems to perform poorly with semicolumns and em dashes
    const texts = 
      ss
        .map(s => s.text)
        .map(s => s.replaceAll(';', '. ')) // experimenting with a full-stop for semicolumns
        .map(s => s.replaceAll('—', ', ')) // em dash is better spoken as a comma
        .map(s => s.toLowerCase());

    const sounds = await Promise.all(texts.map(t => this.#fetchSentence(t)));
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
