import type { SourcePage, ClassifierOptions } from '../types';
import { DirectoryClassifierHandle } from './directory';
import { FrontMatterClassifierHandle } from './frontmatter';

export interface ClassifierHandle<Locals = Record<string, any>, Result = Record<string, any>> {
  (input: { options: ClassifierOptions<Locals>; pages: Array<SourcePage> | any }): Promise<Result>;
}

export interface ClassifierItem {
  (pages: Array<SourcePage>): Promise<Record<string, any>>
}

export interface ClassiferRegister {
  (classifierList: Array<ClassifierOptions>) : Record<string, ClassifierItem>;
}



export const getClassifierMap: ClassiferRegister = (classifierList) => {
  let _classifierMap: Record<string, ClassifierItem> = {};

  classifierList.map(async (options: ClassifierOptions) => {
    let _classifier: ClassifierHandle = undefined;

    if (options.type == 'directory') _classifier = DirectoryClassifierHandle;
    else if (options.type == 'frontmatter') _classifier = FrontMatterClassifierHandle;
    else _classifier = options.type;

    if (!_classifier) {
      throw 'ClassifierHandle not found.';
      return;
    }

    const handler = async(pages: Array<SourcePage>) => {
      return await _classifier({options: options, pages: pages})
    }

    _classifierMap[options.id] = handler;
  });

  return _classifierMap;
};