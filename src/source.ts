import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import {
  getAbsoultPath,
  getRelativePath,
  getSlugParams,
  getPageAttribute,
  extractBody
} from './internal';

import type { 
  SourcePage, 
  SourcePageCollection, 
  SiteConfigDefault, 
  MarkedConfig 
} from './types';

// Get Config.
export const loadConfig = async (configPath?: string): Promise<SiteConfigDefault> => {
  configPath = configPath ?? './src/site.config.js';
  let _path = getAbsoultPath(configPath);

  const isExist = fs.existsSync(_path);
  if (!isExist) {
    // Not a file, or unexists.
    console.warn('config not found');
    return {};
  }

  // is file, import it and loading config.
  const _loadConfig = await import(_path);
  const config = _loadConfig.default;

  if ('marked' in config) {
    loadMarkedConfig(config.marked);
  }
  return config;
};

// Get all pages from sourceDir.
export const loadSourcePages = async (config: Record<string, any>, sourceDir: string): Promise<SourcePageCollection> => {
  return await loadSources(config, sourceDir);
};

// load: All markdown file from /docs/*
const loadSources = async (config: SiteConfigDefault, sourceDir: string) => {
  console.log('::: Loading docs ::: ');
  const relativeDirPath = getRelativePath(sourceDir);
  // loading source by vite & fast-glob.
  let sources = await getAvaliableSource(relativeDirPath);
  let pathMap: Record<string, SourcePage> = {};
  let slugMap: Record<string, Array<SourcePage>> = {};

  const ptn = new RegExp(`^${sourceDir}`);
  // traversal all markdown page.
  await Promise.all(
    Object.entries(sources).map(async ([sourcePath, pageAsync]) => {
      let pageObj = await pageAsync(); // get page's metadata;
      let frontmatter = pageObj.metadata || {};

      // process indexPath & support customize indexPath by frontmatter.
      let indexPath = sourcePath.replace(ptn, '').replace(/(?:\.([^.]+))?$/, '');
      indexPath = frontmatter.indexPath ? frontmatter.indexPath : indexPath;

      // process slugPath & slugMap.
      let { slugKey, slugDate } = getSlugParams(indexPath);
      if (!(slugKey in slugMap)) slugMap[slugKey] = [];

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

      if ('extendPageData' in config) {
        await config.extendPageData(pageStruct);
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
  if ('options' in config) {
    marked.setOptions(config.options);
  }
  if ('extensions' in config) {
    Object.values(config.extensions).map((extension) => marked.use(extension));
  }
};

const attachRender = async (sourcePath: string) => {
  const pageBody = await extractBody(sourcePath);
  return marked.parse(pageBody);
};