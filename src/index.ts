import { loadConfig, loadSourcePages } from './source';
import { classifyPages } from './classifier';
import type { SourcePage, SourcePageCollection } from './types';

let _config: Record<string, any> = undefined;
/**
 * Get siteConfig
 *
 * @async
 * @return {Promise<Record<string, any>>} custom config.
 */
export const siteConfig = async (): Promise<Record<string, any>> => {
  if (!_config) {
    _config = await loadConfig();
  }
  return _config;
};

// cache sourcepages.
let _pageMap: SourcePageCollection = null;

/**
 * Get All source page, index by indexPath
 *
 * @async
 * @return {Promise<Record<string, SourcePage>>} key: IndexPath value: SourcePage
 */
export const pathMap = async (): Promise<Record<string, SourcePage>> => {
  if (!_pageMap) await initializeMap();

  return _pageMap.pathMap;
};

/**
 * Get All source page, index by slugName
 *
 * @async
 * @return {Promise<Record<string, Array<SourcePage>>>}
 */
export const slugMap = async (): Promise<Record<string, Array<SourcePage>>> => {
  if (!_pageMap) await initializeMap();

  return _pageMap.slugMap;
};

// cache classified result.
let _classifiedCollection: Record<string, any> = undefined;
/**
 * Get classified pages set.
 *
 * @async
 * @param {string} classifierId
 * @return {Promise<Record<string,any>>}
 */
export const classifiedSet = async (classifierId: string): Promise<any> => {
  // classify all SourcePage.
  if (!_classifiedCollection) {
    const classifierList = (await siteConfig()).classifier || [];
    const list: Array<SourcePage> = Object.values(await pathMap());
    _classifiedCollection = await classifyPages({ classifierList: classifierList, pages: list });
  }

  const _classifiedSet = _classifiedCollection[classifierId];
  if (_classifiedSet) return _classifiedSet;

  throw new Error(`classifierId: ${classifierId} not found.`);
};

/**
 * Get page by key.
 * @param indexKey  SlugKey | indexPath
 * @param slugMatchFunc 
 * @returns 
 */
export const getPage = async (
  indexKey: string,
  slugMatchFunc?: (page: SourcePage) => boolean
): Promise<SourcePage> => {
  let page = undefined;
  // try get page from slugMap
  const _slugMap = await slugMap();
  let slugPages = _slugMap[indexKey];

  if (slugPages) {
    return slugMatchFunc ? slugPages.find((page) => slugMatchFunc(page)) : slugPages[0];
  }
  // try get page from pageMap
  const _pathMap = await pathMap();
  page = _pathMap[indexKey];
  if (page) return page;

  // throw error message.
  let avaliablePath = Object.keys(_pathMap).join('\r\t');
  throw new Error(`path ${indexKey} is not found. available path:\r\t${avaliablePath} \n`);
};

export const initializeMap = async () => {
  const sourceDir = './docs';
  // initialize projectMap
  let config = await siteConfig();
  _pageMap = await loadSourcePages(config, sourceDir);

};

export type { DirectoryClassifierResult, FrontMatterClassifierResult } from './classifier';
export type { SourcePage };
