import type { SourcePage } from '../types';
import type { ClassifierHandle } from '.';
import { logger } from '../log';

interface DirectoryClassifierParams {
  path: string;
}

export interface DirectoryClassifierResult {
  pages: Array<SourcePage>;
}

export const DirectoryClassifierHandle: ClassifierHandle<
  DirectoryClassifierParams,
  DirectoryClassifierResult
> = async ({ options, pages }) => {
  let _classifiedPages = [];
  let { id, params } = options;

  pages.map((page: SourcePage) => {
    const { sourcePath } = page;
    if (!sourcePath.includes(params.path)) return;

    _classifiedPages.push(page);
  });

  logger.info(`::: Run DirectoryClassifierHandle - ${id}`);

  return { pages: _classifiedPages };
};
