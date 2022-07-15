import type { SourcePage } from '../types';
import type { ClassifierHandle } from '.';

interface FrontMatterClassifierParams {
  keys: Array<string>;
}

export type FrontMatterClassifierResult = Record<string, Array<SourcePage>>;

export const FrontMatterClassifierHandle: ClassifierHandle<
  FrontMatterClassifierParams,
  FrontMatterClassifierResult
> = async ({ options, pages }) => {
  let _classifiedPages = {};
  let { params } = options;

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
