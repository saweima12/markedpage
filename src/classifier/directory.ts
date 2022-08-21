import type { SourcePage, DirectoryClassifierResult } from '../types';
import type { ClassifierHandle } from '../types';
import { logger } from '../log';

interface DirectoryClassifierParams {
  path: string;
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
