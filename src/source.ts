import fs from 'fs';
import path from 'path';
import { marked }  from 'marked';
import { getAbsoultPath, getRelativePath, extractMeta, extractBody } from './internal';

import type { MarkedConfig } from './internal';
import type { SourcePage, SourcePageCollection } from './types';
// Get all pages from sourceDir.
export const loadSourcePages = async (sourceDir: string): Promise<SourcePageCollection> => {
  return await loadSources(sourceDir);
};

// Get Config.
export const loadConfig = async (configPath?: string): Promise<Record<string, any>> => {
  configPath = configPath ?? "./src/site.config.js";
  let _path = getAbsoultPath(configPath);
  
  const isExist = fs.existsSync(_path);
  if (isExist) {
    // is file, import it and loading config.
    const _loadConfig = await import(_path);
    const config = _loadConfig.default;
    
    if ('marked' in config) {
      loadMarkedConfig(config.marked);
    }

    return config;

  } else {
    // Not a file, or unexists.
    console.warn("config not found");
    return {}
  }

}

// load: All markdown file from /docs/*
const loadSources = async (sourceDir: string) => {
  console.log('::: Loading docs ::: ');
  console.log(sourceDir)
  const relativeDirPath = getRelativePath(sourceDir)
  // loading source by vite & fast-glob.
  let sources = await getAvaliableSource(relativeDirPath);
  let pathMap: Record<string, SourcePage> = {};
  let slugMap: Record<string, Array<SourcePage>> = {};
  await Promise.all(
    Object.entries(sources).map(async ([sourcePath, pageAsync]) => {
      let pageObj = await pageAsync(); // get page data by lazyloading
      // get file path & created datetime.
      const fStat = await fs.promises.stat(sourcePath);
      let frontmatter = pageObj.metadata || {};
      // process indexPath & support customize indexPath by frontmatter.
      const ptn = new RegExp(`^${sourceDir}`);
      let indexPath = sourcePath.replace(ptn, '').replace(/(?:\.([^.]+))?$/, '');
      indexPath = frontmatter.indexPath ? frontmatter.indexPath : indexPath;
      // process slugPath.
      let { slugKey, slugDate } = getSlugParams(indexPath);
      // if scheme like: 2021-09-30-foo-bar, extract slug.
      if (!(slugKey in slugMap)) slugMap[slugKey] = [];
      // attach created datetime & get indexPath.
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
        render: () => attachRender(pageObj.path),
        slugKey: slugKey
      };

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


const getAvaliableSource = async (sourceDir: string, filter=['.md']) => {  
  // define recursive method.
  const walk = async (sourcePath: string, initialContainer: Object) => {
    let items = await fs.promises.readdir(sourcePath);
    
    await Promise.all(items.map(async (item: string) => {
      const itemPath = path.join(sourcePath, item);
      const fullPath = getAbsoultPath(itemPath);
      
      const fstat = await fs.promises.stat(fullPath);
      if (fstat.isDirectory())  {
        initialContainer = await walk(itemPath, initialContainer);

      } else if (fstat.isFile()) {
        filter.map( (sname: string) => {
          if (item.includes(sname)) {
            initialContainer[itemPath] = () => extractMeta(fullPath);
          }
        }); 
      }
    }));

    return initialContainer
  }; 
  return await walk(sourceDir, {});
}




// load all markedConfig from config.marked
const loadMarkedConfig = (config: MarkedConfig) => {
  if ('options' in config) {
    marked.setOptions(config.options);
  }
  if ('extensions' in config) {
    Object.values(config.extensions).map(extension => marked.use(extension));
  }
}

const attachRender = async (sourcePath: string) => {
  const pageBody = await extractBody(sourcePath);
  return marked.parse(pageBody);
}; 



const getSlugParams = (indexPath: string) => {
  let baseName = path.basename(indexPath);
  // match slug params
  const regex = /([0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2})\-(.+)/;
  let match = baseName.match(regex);

  if (match) return { slugKey: match[2], slugDate: new Date(match[1]) };
  return { slugKey: baseName, slugDate: undefined };
};

