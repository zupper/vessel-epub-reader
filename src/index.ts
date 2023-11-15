import App from './app/App';
import EpubjsBookReader from "./infra/epub/EpubjsBookReader";
import SimpleReadingArea from './infra/view/SimpleReadingArea';


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
    reader.view = readingArea.view;

    document.querySelector('body').appendChild(readingArea);
  });
