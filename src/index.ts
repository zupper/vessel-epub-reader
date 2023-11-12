import { App } from './App';
import EpubjsBookReader from "./EpubjsBookReader";
import SimpleReadingArea from './view/SimpleReadingArea';

const readingArea = new SimpleReadingArea();
document.querySelector('body').appendChild(readingArea);

window.addEventListener(
  "load",
  async () => {
    const app = new App({
      bookReader:  new EpubjsBookReader(),
      readingArea: readingArea,
      storage: {
        set: (key: string, value: string) => localStorage.setItem(key, value),
        get: (key: string) => localStorage.getItem(key)
      }
    });
    console.log(await app.openBook("https://s3.amazonaws.com/moby-dick/moby-dick.epub"));
  });
