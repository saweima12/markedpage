import { getConfig, getPageMap } from './source';
import { initClassifierMap, getClassifiedResult, isInitial } from './classifier';

import type { SourcePage } from './types';

/**
 * Get siteConfig
 *
 * @async
 * @return {Promise<Record<string, any>>} custom config.
 */
export const siteConfig = async (): Promise<Record<string, any>> => {
  return await getConfig();
};


/**
 * Get All source page, index by indexPath
 *
 * @async
 * @return {Promise<Record<string, SourcePage>>} key: IndexPath value: SourcePage
 */
export const pathMap = async (): Promise<Record<string, SourcePage>> => {
  const _pageMap = await pageMap();
  return _pageMap.pathMap;
};

/**
 * Get All source page, index by slugName
 *
 * @async
 * @return {Promise<Record<string, Array<SourcePage>>>}
 */
export const slugMap = async (): Promise<Record<string, Array<SourcePage>>> => {
  const _pageMap = await pageMap();
  return _pageMap.slugMap;
};


/**
 * Get classified pages set.
 *
 * @async
 * @param {string} classifierId
 * @return {Promise<Record<string,any>>}
 */
export const classifiedSet = async (classifierId: string): Promise<any> => {
  // Register all classifier.
  if (!isInitial) {
    const classifierList = (await siteConfig()).classifier || [];
    await initClassifierMap(classifierList);
  }

  const pageList: Array<SourcePage> = Object.values(await pathMap());
  const _classifiedSet = await getClassifiedResult(classifierId, pageList);

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

export const pageMap = async () => {
  const sourceDir = './docs';
  // initialize projectMap
  let config = await siteConfig();
  return await getPageMap(config, sourceDir);
};

export type { DirectoryClassifierResult } from './classifier/directory';
export type { FrontMatterClassifierResult } from './classifier/frontmatter';
export type { SourcePage };
