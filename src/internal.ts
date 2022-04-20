import fs from 'fs';
import fm from 'front-matter';
import path from 'path';
import { marked } from 'marked'

export const getAbsoultPath = (relativePath: string): string => {
  const cwd = process.cwd();
  return path.join(cwd, relativePath);
}

export const getRelativePath = (absoultPath: string): string => {
  const cwd = process.cwd();
  return path.relative(cwd, absoultPath);
}

export const parserMd = async (sourcePath: string) => {
  // loading markdown content.
  const temp = await fs.promises.readFile(sourcePath);
  const content = temp.toString();
  // process fonrtmatter
  const matterObj = fm(content)
  const html = marked.parse(matterObj.body)

  return {
    metadata: matterObj.attributes,
    body: html
  }
}
