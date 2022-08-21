export interface SourcePage extends Record<string, any> {
  frontMatter: Record<string, any>;
  sourcePath: string;
  indexPath: string;
  headings: Array<HeadingItem>;
  render: (() => Promise<string>) | any;
  raw: () => Promise<string>;
  slugKey: string;
}

export interface PageMapCollection {
  pathMap: Record<string, SourcePage>;
  slugMap: Record<string, Array<SourcePage>>;
}

export interface SiteConfigDefault extends Record<string, any> {
  extendPageData?: (pages: SourcePage) => Promise<void>;
  marked?: MarkedConfig;
  classifier?: Array<ClassifierOptions>;
}

export interface SourceParams extends Record<string, any> {
  sourcePath: string;
  indexPath: string;
  fullPath: string;
}

export interface MarkedConfig {
  options: Record<string, any>;
  extensions: Array<any>;
}

export interface HeadingItem extends Record<string, any> {
  depth: number;
  text: string;
  raw: string;
  id: string;
}

export interface ClassifierOptions<Locals = Record<string, any>> {
  id: string;
  type: ClassifierType;
  params: Locals;
}

export interface ClassifierHandle<Locals = Record<string, any>, Result = Record<string, any>> {
  (input: { options: ClassifierOptions<Locals>; pages: Array<SourcePage> | any }): Promise<Result>;
}

export type ClassifierType = 'directory' | 'frontmatter' | ClassifierHandle;
