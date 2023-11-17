import config from './config';
import App from './app/App';
import EpubjsBookReader from "./infra/epub/EpubjsBookReader";
import SimpleReadingArea from './infra/view/SimpleReadingArea';
import HowlerPlayer from 'infra/HowlerPlayer';
import Mimic3TTSSource from 'infra/Mimic3TTSSource';

window.addEventListener(
  "load",
  async () => {
    const reader = new EpubjsBookReader();
    const app = new App({
      bookReader: reader,
      storage: {
        set: (key: string, value: string) => localStorage.setItem(key, value),
        get: (key: string) => localStorage.getItem(key)
      },
      player: new HowlerPlayer(),
      tts: new Mimic3TTSSource(config.mimicApiUrl),
    });

    const readingArea = new SimpleReadingArea(app);
    reader.view = readingArea.view;

    document.querySelector('body').appendChild(readingArea);
  });
