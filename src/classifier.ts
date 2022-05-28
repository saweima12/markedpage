import type { SourcePage, ClassifierOptions } from './types';

export interface ClassifierHandle<Locals = Record<string, any>, Result = Record<string, any>> {
  (input: { options: ClassifierOptions<Locals>; pages: Array<SourcePage> | any }): Promise<Result>;
}

export interface ClassifyHandle {
  (input: { classifierList: Array<ClassifierOptions>; pages: Array<SourcePage> }): Promise<
    Record<string, unknown>
  >;
}

export const classifyPages: ClassifyHandle = async (input) => {
  let _classifiedMap: Record<string, any> = {};
  const { classifierList, pages } = input;

  classifierList.map(async (_classifierOption: ClassifierOptions) => {
    let _classifier: ClassifierHandle = undefined;

    if (_classifierOption.type == 'directory') _classifier = DirectoryClassifierHandle;
    else if (_classifierOption.type == 'frontmatter') _classifier = FrontMatterClassifierHandle;
    else _classifier = _classifierOption.type;

    if (!_classifier) return;

    // classify by classifier
    const _pages = await _classifier({ options: _classifierOption, pages: pages });
    _classifiedMap[_classifierOption.id] = _pages;
  });

  return _classifiedMap;
};

interface DirectoryClassifierParams {
  path: string;
}

export interface DirectoryClassifierResult {
  pages: Array<SourcePage>;
}

const DirectoryClassifierHandle: ClassifierHandle<
  DirectoryClassifierParams,
  DirectoryClassifierResult
> = async ({ options, pages }) => {
  let _classifiedPages = [];
  let { id, params } = options;

  console.log(`::: Run DirectoryClassifierHandle -  ${id} :::`);
  pages.map((page: SourcePage) => {
    const { sourcePath } = page;
    if (!sourcePath.includes(params.path)) return;

    _classifiedPages.push(page);
  });

  return { pages: _classifiedPages };
};

interface FrontMatterClassifierParams {
  keys: Array<string>;
}

export type FrontMatterClassifierResult = Record<string, Array<SourcePage>>;

const FrontMatterClassifierHandle: ClassifierHandle<
  FrontMatterClassifierParams,
  FrontMatterClassifierResult
> = async ({ options, pages }) => {
  let _classifiedPages = {};
  let { id, params } = options;

  console.log(`::: Run FrontMatterClassifierHandle -  ${id} :::`);
  pages.map((page: SourcePage) => {
    const frontMatter = page.frontMatter;

    params.keys.map((key: string) => {
      if (!(key in frontMatter)) return;

      const fieldValue = frontMatter[key];
      if (typeof fieldValue == 'string') {
        _classifierIndexAdd(_classifiedPages, fieldValue, page);
      } else {
        Object.values(fieldValue).map((value: string) => {
          _classifierIndexAdd(_classifiedPages, value, page);
        });
      }
    });
  });
  return _classifiedPages;
};

const _classifierIndexAdd = (map: Record<string, any> | Object, key: string, item: any) => {
  if (!map.hasOwnProperty(key)) map[key] = [];

  map[key].push(item);
};
