import config from './config';
import App from './app/App';
import EpubjsBookReader from "./infra/epub/EpubjsBookReader";
import SimpleReadingArea from './infra/view/SimpleReadingArea';
import HowlerPlayer from 'infra/HowlerPlayer';
import Mimic3TTSSource from 'infra/Mimic3TTSSource';
import LocalStringStorage from 'infra/LocalStringStorage';
import DefaultBookSourceReader from 'infra/DefaultBookSourceReader';
import LibraryView from 'infra/view/LibraryView';
import OPFSBookRepository from 'infra/OPFSBookRepository';

window.addEventListener(
  "load",
  async () => {
    const reader = new EpubjsBookReader();
    const app = new App({
      bookReader: reader,
      io: {
        stringStorage: new LocalStringStorage(),
        bookSourceReader: new DefaultBookSourceReader(),
      },
      player: new HowlerPlayer(),
      tts: new Mimic3TTSSource(config.mimicApiUrl),
      bookRepository: new OPFSBookRepository(),
    });

    const libraryView = new LibraryView(app);

    const readingArea = new SimpleReadingArea(app);
    reader.view = readingArea.view;

    document.querySelector('body').appendChild(readingArea);
  });
