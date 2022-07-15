import type { SourcePage, ClassifierOptions } from '../types';
import { DirectoryClassifierHandle } from './directory';
import { FrontMatterClassifierHandle } from './frontmatter';

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

    if (!_classifier) {
      throw 'ClassifierHandle not found.';
      return;
    }

    // classify by classifier
    const _pages = await _classifier({ options: _classifierOption, pages: pages });
    _classifiedMap[_classifierOption.id] = _pages;
  });

  return _classifiedMap;
};