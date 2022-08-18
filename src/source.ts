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

import type {
  SourcePage,
  SourceParams,
  PageMapCollection,
  SiteConfigDefault,
  MarkedConfig
} from './types';
import { logger } from './log';

// config cache.
let _config: Record<string, any> = undefined;

export const getConfig = async (configPath?: string) => {
  if (!_config) await initConfigDefault(configPath);
  return _config;
};

export const setConfig = (config: Record<string, any>) => {
  _config = config;

  if (config.hasOwnProperty('marked')) {
    loadMarkedConfig(config.marked);
  }
};

export const initConfigDefault = async (configPath?: string): Promise<SiteConfigDefault> => {
  configPath = configPath ?? './src/site.config.js';
  // get absoult path.
  let _path = getAbsoultPath(configPath);

  // check config.js exists.
  const isExist = fs.existsSync(_path);
  if (!isExist) {
    // Not a file, or unexists.
    console.warn('config not found');
    setConfig({});
    return;
  }

  // is file, import it and loading config.
  const _loadConfig = await import(/* @vite-ignore */ _path);
  const config = _loadConfig.default;
  setConfig(config);
};

// cache sourceDir path & pageMap.
let _sourceDir: string = '';
let _pageMap: PageMapCollection = undefined;

export const getPageMap = async (config: SiteConfigDefault, sourceDir?: string) => {
  if (!_pageMap) {
    logger.debug('::: Loading docs');
    await initPageMap(config, sourceDir);
  }
  return _pageMap;
};

// loading all pages from sourceDir.
export const initPageMap = async (config: SiteConfigDefault, sourceDir?: string) => {
  // default source dir.
  _sourceDir = sourceDir || './docs';

  // define path parameter
  const relativeDirPath = getRelativePath(_sourceDir);
  let sources = await getAvaliableSource(relativeDirPath);

  // define result block;
  let pathMap: Record<string, SourcePage> = {};
  let slugMap: Record<string, Array<SourcePage>> = {};

  const sourceDirPtn = new RegExp(`^${_sourceDir}`);
  await Promise.all(
    sources.map(async (sourcePath: string) => {
      // process
      const fullPath = getAbsoultPath(sourcePath);
      const defaultIndexPath = sourcePath.replace(sourceDirPtn, '').replace(/(?:\.([^.]+))?$/, '');
      const params = {
        sourcePath: sourcePath,
        fullPath: fullPath,
        indexPath: defaultIndexPath
      };

      const temp = await fs.promises.readFile(fullPath);
      const content = temp.toString();
      const pageSturct = await loadSourcePage(config, content, params);

      if (!pageSturct) return;

      const { slugKey, indexPath } = pageSturct;

      // add page to pathMap
      pathMap[indexPath] = pageSturct;
      // add page to slugMap
      if (!slugMap.hasOwnProperty(slugKey)) slugMap[slugKey] = [];
      slugMap[slugKey].push(pageSturct);
    })
  );

  _pageMap = { pathMap: pathMap, slugMap: slugMap };
};

export const reloadSourcePage = async (
  config: SiteConfigDefault,
  sourcePath: string,
  content: string
) => {
  if (!_pageMap) await initPageMap(config);

  const sourceDirPtn = new RegExp(`^${_sourceDir}`);
  // process filepath
  const fullPath = getAbsoultPath(sourcePath);
  const defaultIndexPath = sourcePath.replace(sourceDirPtn, '').replace(/(?:\.([^.]+))?$/, '');
  const params = {
    sourcePath: sourcePath,
    fullPath: fullPath,
    indexPath: defaultIndexPath
  };
  const pageStruct = await loadSourcePage(config, content, params);
  if (!pageStruct) return;

  const { indexPath } = pageStruct;

  if (!_pageMap.pathMap[indexPath]) {
    // indexPath change, reload pageMap
    await initPageMap(config, _sourceDir);
    logger.debug(`Detect file's indexPath change, reload pageMap.`);
    return pageStruct;
  }

  logger.debug(`Detect file [ ${sourcePath} ] change, reload page.`);
  // indexPath not change, overwrite struct.
  _pageMap.pathMap[indexPath] = pageStruct;
  return pageStruct;
};

// load: All markdown file from /docs/*
const loadSourcePage = async (config: SiteConfigDefault, content: string, params: SourceParams) => {
  // get params.
  let { fullPath, indexPath, sourcePath } = params;
  let { metadata, headings } = await getPageAttribute(content);

  // exclude draft file on build.
  if (metadata._draft && !isDev()) return;

  // get slugKey & indexPath
  let newIndexPath = metadata.indexPath || indexPath;
  let { slugKey, slugDate } = getSlugParams(indexPath);
  // set created field
  const fStat = await fs.promises.stat(params.fullPath);
  metadata.created = metadata.created || slugDate || fStat.birthtime;

  // generate struct.
  const pageStruct = {
    frontMatter: metadata,
    sourcePath: sourcePath,
    indexPath: newIndexPath,
    headings: headings,
    render: () => getRender(fullPath),
    raw: () => getRaw(sourcePath),
    slugKey: slugKey
  };

  if (config.hasOwnProperty('extendPageData')) {
    await config.extendPageData(pageStruct);
  }
  return pageStruct;
};

const getAvaliableSource = async (sourceDir: string) => {
  // define recursive method to traversal all .md file under /docs.
  const walk = async (sourcePath: string, initialArray: Array<string>) => {
    let items = await fs.promises.readdir(sourcePath);
    await Promise.all(
      items.map(async (item: string) => {
        // process file path.
        const itemPath = path.join(sourcePath, item);
        const fullPath = getAbsoultPath(itemPath);

        // make sure item is .md file.
        const fstat = await fs.promises.stat(fullPath);
        if (fstat.isDirectory()) {
          initialArray = await walk(itemPath, initialArray);
        } else if (fstat.isFile()) {
          if (item.includes('.md')) initialArray.push(itemPath);
        }
      })
    );
    return initialArray;
  };
  return await walk(sourceDir, []);
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

const getRaw = async (fullpath: string) => {
  const temp = await fs.promises.readFile(fullpath);
  const content = temp.toString();
  return await extractBody(content);
};

const getRender = async (fullpath: string) => {
  const rawBody = await getRaw(fullpath);
  return marked.parse(rawBody);
};
