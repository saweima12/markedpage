import type { SourcePage, ClassifierOptions } from '../types';
import { DirectoryClassifierHandle } from './directory';
import { FrontMatterClassifierHandle } from './frontmatter';

export interface ClassifierHandle<Locals = Record<string, any>, Result = Record<string, any>> {
  (input: { options: ClassifierOptions<Locals>; pages: Array<SourcePage> | any }): Promise<Result>;
}

export interface ClassifierItem {
  (pages: Array<SourcePage>): Promise<Record<string, any>>;
}

interface ClassiferMapHandler {
  (classifierList: Array<ClassifierOptions>): Record<string, ClassifierItem>;
}

export let isInitial = false;
let classifiedPageCache: Record<string, any> = {};
let classifierMap: Record<string, ClassifierItem> = {};

export const getClassifiedResult = async (classifierId: string, pages: Array<SourcePage>) => {
  if (!classifierMap.hasOwnProperty(classifierId)) {
    console.warn(`${classifierId} key not found.`);
    return null;
  }

  if (classifiedPageCache.hasOwnProperty(classifierId)) {
    return classifiedPageCache[classifierId];
  }

  const _classifier = classifierMap[classifierId];
  // get result data & cache it.
  let result = await _classifier(pages);
  classifiedPageCache[classifierId] = result;
  return result;
};

export const initClassifierMap: ClassiferMapHandler = (classifierList) => {
  classifierMap = {};

  classifierList.map(async (options: ClassifierOptions) => {
    let _classifier: ClassifierHandle = undefined;

    if (options.type == 'directory') _classifier = DirectoryClassifierHandle;
    else if (options.type == 'frontmatter') _classifier = FrontMatterClassifierHandle;
    else _classifier = options.type;

    if (!_classifier) {
      throw 'ClassifierHandle not found.';
      return;
    }

    const handler = async (pages: Array<SourcePage>) => {
      return await _classifier({ options: options, pages: pages });
    };

    classifierMap[options.id] = handler;
  });

  // Clear classifiedPage Cache
  classifiedPageCache = {};
  isInitial = true;

  return classifierMap;
};
