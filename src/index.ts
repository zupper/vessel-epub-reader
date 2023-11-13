import { App } from './App';
import EpubjsBookReader from "./EpubjsBookReader";
import SimpleReadingArea from './view/SimpleReadingArea';


window.addEventListener(
  "load",
  async () => {
    const reader = new EpubjsBookReader();
    const app = new App({
      bookReader: reader,
      storage: {
        set: (key: string, value: string) => localStorage.setItem(key, value),
        get: (key: string) => localStorage.getItem(key)
      }
    });

    const readingArea = new SimpleReadingArea(app);
    reader.readingArea = readingArea;

    document.querySelector('body').appendChild(readingArea);

    console.log(await app.openBook("https://s3.amazonaws.com/moby-dick/moby-dick.epub"));
  });
