import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import {
  isDev,
  getAbsoultPath,
  getRelativePath,
  getSlugParams,
  getPageAttribute,
  extractBody
} from './internal';

import type { SourcePage, SourcePageCollection, SiteConfigDefault, MarkedConfig } from './types';
import { logger } from './log';
import { pathMap } from './main';

// config cache.
let _config: Record<string, any> = undefined;

export const getConfig = async (configPath?: string) => {
  if (!_config) _config = await loadConfigDefault(configPath);
  return _config;
};

export const setConfig = (config: Record<string, any>) => {
  _config = config;

  if (config.hasOwnProperty('marked')) {
    loadMarkedConfig(config.marked);
  }

}

export const loadConfigDefault = async (configPath?: string): Promise<SiteConfigDefault> => {
  configPath = configPath ?? './src/site.config.js';
  // get absoult path.
  let _path = getAbsoultPath(configPath);

  // check config.js exists.
  const isExist = fs.existsSync(_path);
  if (!isExist) {
    // Not a file, or unexists.
    console.warn('config not found');
    return {};
  }

  // is file, import it and loading config.
  const _loadConfig = await import(/* @vite-ignore */ _path);
  const config = _loadConfig.default;

  if (config.hasOwnProperty('marked')) {
    loadMarkedConfig(config.marked);
  }

  // update config cache.
  _config = config;

  return config;
};

let _pageMap: SourcePageCollection = undefined;

export const getPageMap = async (config: SiteConfigDefault, sourceDir?: string) => {
  if (!_pageMap) {
    logger.debug("::: Loading docs")
    await initPageMap(config, sourceDir);
  }
  return _pageMap;
};

// loading all pages from sourceDir.
export const initPageMap = async (config: SiteConfigDefault, sourceDir?: string) => {
  sourceDir = sourceDir ?? './docs';
  
  // define path parameter
  const relativeDirPath = getRelativePath(sourceDir);
  let sources = await getAvaliableSource(relativeDirPath);
  
  // define result block;
  let pathMap: Record<string, SourcePage> = {};
  let slugMap: Record<string, Array<SourcePage>> = {};
  
  // 
  const sourceDirPtn = new RegExp(`^${sourceDir}`);
  await Promise.all(
    Object.entries(sources).map(async ([sourcePath, pageAsync]) => {
      const pageObj = await pageAsync();

    })
  );


  _pageMap = { pathMap: pathMap, slugMap: slugMap }
};

// load: All markdown file from /docs/*
const loadSourcePages = async (config: SiteConfigDefault, sourceDir: string) => {
  const relativeDirPath = getRelativePath(sourceDir);
  // loading source by vite & fast-glob.
  let sources = await getAvaliableSource(relativeDirPath);
  let pathMap: Record<string, SourcePage> = {};
  let slugMap: Record<string, Array<SourcePage>> = {};

  const ptn = new RegExp(`^${sourceDir}`);
  // traversal alfl markdown page.
  await Promise.all(
    Object.entries(sources).map(async ([sourcePath, pageAsync]) => {
      let pageObj = await pageAsync(); // get page's metadata;
      let frontmatter = pageObj.metadata || {};

      // process indexPath & support customize indexPath by frontmatter.
      let indexPath = sourcePath.replace(ptn, '').replace(/(?:\.([^.]+))?$/, '');
      indexPath = frontmatter.indexPath ? frontmatter.indexPath : indexPath;

      // process slugPath & slugMap.
      let { slugKey, slugDate } = getSlugParams(indexPath);
      if (!slugMap.hasOwnProperty(slugKey)) slugMap[slugKey] = [];

      // get file path & created datetime.
      const fStat = await fs.promises.stat(sourcePath);
      frontmatter.created = frontmatter.created
        ? frontmatter.created
        : slugDate
        ? slugDate
        : fStat.birthtime;

      // generate struct.
      const pageStruct = {
        frontMatter: frontmatter,
        sourcePath: sourcePath,
        indexPath: indexPath,
        headings: pageObj.headings,
        render: () => attachRender(pageObj.path),
        raw: () => extractBody(sourcePath),
        slugKey: slugKey
      };

      if (config.hasOwnProperty('extendPageData')) {
        await config.extendPageData(pageStruct);
      }

      if (frontmatter._draft && !isDev()) {
        return;
      }

      // add to pathMap & slugMap
      pathMap[indexPath] = pageStruct;
      slugMap[slugKey].push(pageStruct);
      return pageStruct;
    })
  );
  return {
    pathMap: pathMap,
    slugMap: slugMap
  };
};

const getAvaliableSource = async (sourceDir: string, filter = ['.md']) => {
  // define recursive method to traversal all .md file under /docs.
  const walk = async (sourcePath: string, initialContainer: Object) => {
    let items = await fs.promises.readdir(sourcePath);
    await Promise.all(
      items.map(async (item: string) => {
        // process file path.
        const itemPath = path.join(sourcePath, item);
        const fullPath = getAbsoultPath(itemPath);

        const fstat = await fs.promises.stat(fullPath);
        if (fstat.isDirectory()) {
          initialContainer = await walk(itemPath, initialContainer);

        } else if (fstat.isFile()) {
          filter.map((sname: string) => {
            if (item.includes(sname)) {
              initialContainer[itemPath] = () => getPageAttribute(fullPath);
            }
          });
        }
      })
    );
    return initialContainer;
  };
  return await walk(sourceDir, {});
};

// load all markedConfig from config.marked
const loadMarkedConfig = (config: MarkedConfig) => {
  if (config.hasOwnProperty('options')) {
    marked.setOptions(config.options);
  }
  if (config.hasOwnProperty('extensions')) {
    Object.values(config.extensions).map((extension) => marked.use(extension));
  }
};

const attachRender = async (sourcePath: string) => {
  const pageBody = await extractBody(sourcePath);
  return marked.parse(pageBody);
};
