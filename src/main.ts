export { getPage, siteConfig, slugMap, pathMap, classifiedSet } from './index';
export { markedpageVitePlugin, onContentUpdate } from './vite';

export type { ClassifierHandle } from './classifier';
export type { DirectoryClassifierResult } from './classifier/directory';
export type { FrontMatterClassifierResult } from './classifier/frontmatter';
export type { SourcePage, PageMapCollection } from './types';
