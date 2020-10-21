import { delay, clearLocalStorage } from './hook';
import { checkFilenameForExist } from './test-utils.spec';
import {
  createLocation,
  openLocation,
  closeFileProperties,
  defaultLocationPath,
  defaultLocationName
} from './location.helpers';

import fs from 'fs-extra';

export const regexQuery = '!"#$%&\'()*+,-./@:;<=>[\\]^_`{|}~';
export const searchTag = 'tag1';
export const searchTagDate = '201612';
export const searchSubFolder = '/search';
export const testFileInSubDirectory = 'sample_exif';
export const testFilename = 'sample.desktop';
export const firstTagButton = '/tbody/tr[1]/td[3]/button[1]';

export async function searchEngine(filename, tagName, resetSearchButton) {
  const searchElem = await global.client.$('[data-tid=search]');
  await searchElem.waitForDisplayed();
  await searchElem.click();
  await delay(1500);
  const searchInput = await global.client.$('#textQuery');
  await searchInput.waitForDisplayed();
  await searchInput.setValue(filename);

  if (tagName) {
    const searchTags = await global.client.$('#searchTags');
    await searchTags.waitForDisplayed();
    await searchTags.setValue(tagName);
  }

  if (resetSearchButton) {
    const resetSearch = await global.client.$('#resetSearchButton');
    await resetSearch.waitForDisplayed();
    await resetSearch.click();
  } else {
    const searchButton = await global.client.$('#searchButton');
    await searchButton.waitForDisplayed();
    await searchButton.click();
  }
  await delay(1000);
}

export async function createNewFile() {
  const dirMenu = await global.client.$(
    '[data-tid=folderContainerOpenDirMenu]'
  );
  await dirMenu.waitForDisplayed();
  await dirMenu.click();

  const createNewFile = await global.client.$('[data-tid=createNewFile]');
  await createNewFile.waitForDisplayed();
  await createNewFile.click();

  const createTextFileButton = await global.client.$(
    '[data-tid=createTextFileButton]'
  );
  await createTextFileButton.waitForDisplayed();
  await createTextFileButton.click();
}

describe('TSTissue1212 - Test Search in file structure: search for files with a specific tag:', () => {
  beforeEach(async () => {
    await clearLocalStorage();

    // create the testfiles
    await fs.outputFile(
      defaultLocationPath + '/' + '12345678910123456 re 12345678 [tag1].txt',
      'hello!'
    ); // not found
    await fs.outputFile(
      defaultLocationPath + '/' + '1234567891012345 re 12345678 [tag2].txt',
      'hello!'
    ); // found

    await closeFileProperties();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, false);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });
  afterEach(async () => {
    // clean up testfiles
    await fs.remove(
      defaultLocationPath + '/' + '12345678910123456 re 12345678 [tag1].txt'
    );
    await fs.remove(
      defaultLocationPath + '/' + '1234567891012345 re 12345678 [tag2].txt'
    );
  });

  // this test fails
  it('TSTissue1212  - Should find 12345678910123456 re 12345678 [tag1].txt when searching for tag1', async () => {
    const filenameToSearch = '12345678910123456 re 12345678';

    await searchEngine('tag1');
    // expected current filename
    await checkFilenameForExist(filenameToSearch);
  });

  // this test passes: although the search seems similar
  it('TSTissue1212  - Should find 1234567891012345 re 12345678 [tag2].txt when searching for tag2', async () => {
    const filenameToSearch = '1234567891012345 re 12345678';

    await searchEngine('tag2');
    // expected current filename
    await checkFilenameForExist(filenameToSearch);
  });
});
