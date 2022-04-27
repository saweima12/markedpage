/**
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface SourcePage extends Record<string, any> {
  frontMatter: Record<string, any>;
  sourcePath: PathLike | string;
  indexPath: PathLike | string;
  render: (() => Record<string, any>) | any;
  slugKey: string;
}

export interface SourcePageContext extends Record<string, any> {
  html?: string;
  header?: string;
  css?: Record<string, any>;
  style: string;
}

export interface SourcePageCollection {
  pathMap: Record<string, SourcePage>;
  slugMap: Record<string, Array<SourcePage>>;
}

