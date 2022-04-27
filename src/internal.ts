import fs from 'fs';
import fm from 'front-matter';
import path from 'path';
import type { SourcePage } from './types'


export interface MarkedConfig {
  options: Record<string, any>,
  extensions: Array<any>,
}


export const getAbsoultPath = (relativePath: string): string => {
  const cwd = process.cwd();
  return path.join(cwd, relativePath);
}

export const getRelativePath = (absoultPath: string): string => {
  const cwd = process.cwd();
  return path.relative(cwd, absoultPath);
}

export const extractMeta = async (sourcePath: string) => {
  // loading markdown content.
  const temp = await fs.promises.readFile(sourcePath);
  const content = temp.toString();
  // process fonrtmatter
  const matterObj = fm(content)

  return {
    metadata: matterObj.attributes,
    path: sourcePath,
  }
};

export const extractBody = async (sourcePath: string): Promise<string> => {
  // loading markdown content.
  const temp = await fs.promises.readFile(sourcePath);
  const content = temp.toString();
  const matterObj = fm(content);
  // return body string.
  return matterObj.body;
};
