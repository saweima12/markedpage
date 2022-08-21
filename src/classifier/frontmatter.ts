import type { SourcePage, FrontMatterClassifierResult } from '../types';
import type { ClassifierHandle } from '../types';
import { logger } from '../log';

interface FrontMatterClassifierParams {
  keys: Array<string>;
}

export const FrontMatterClassifierHandle: ClassifierHandle<
  FrontMatterClassifierParams,
  FrontMatterClassifierResult
> = async ({ options, pages }) => {
  let _classifiedPages = {};
  let { id, params } = options;

  pages.map((page: SourcePage) => {
    const frontMatter = page.frontMatter;

    params.keys.map((key: string) => {
      if (!frontMatter.hasOwnProperty(key)) return;

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

  logger.info(`::: Run FrontMatterClassifierHandle - ${id}`);
  return _classifiedPages;
};

const _classifierIndexAdd = (map: Record<string, any> | Object, key: string, item: any) => {
  if (!map.hasOwnProperty(key)) map[key] = [];

  map[key].push(item);
};
