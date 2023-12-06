import { v3 as murmurhashV3 } from "murmurhash";

export default class HashGenerator {
  generate(s: string) {
    return murmurhashV3(s).toString();
  }
}
