import { loadModule } from "hunspell-asm";
import * as fs from 'fs';
import * as path from 'path';

const initializeHunspell = async (extensionPath: string) => {
  const dictionaryPath = path.join(extensionPath, 'dictionaries');
  const affPath = path.join(dictionaryPath, 'ko.aff');
  const dicPath = path.join(dictionaryPath, 'ko.dic');
  const affBuffer = await fs.promises.readFile(affPath);
  const dicBuffer = await fs.promises.readFile(dicPath);
  const affUint8Array = new Uint8Array(affBuffer);
  const dicUint8Array = new Uint8Array(dicBuffer);
		
  const hunspellFactory = await loadModule();
  const affFile = hunspellFactory.mountBuffer(affUint8Array);
  const dicFile = hunspellFactory.mountBuffer(dicUint8Array);
  const hunspell = hunspellFactory.create(affFile, dicFile);
  
  return hunspell;
};

export default initializeHunspell;