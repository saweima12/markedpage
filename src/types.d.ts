/**
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface SourcePage extends Record<string, any> {
  frontMatter: Record<string, any>;
  sourcePath: PathLike | string;
  indexPath: PathLike | string;
  headings: Array<HeadingItem>;
  render: (() => Record<string, any>) | any;
  slugKey: string;
}

export interface SourcePageCollection {
  pathMap: Record<string, SourcePage>;
  slugMap: Record<string, Array<SourcePage>>;
}

export interface HeadingItem extends Record<string, any>{
  depth: number;
  text: string;
  raw: string;
}