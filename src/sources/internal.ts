import fm from 'front-matter';
import removeMd from 'remove-markdown';
import path from 'path';

import type { HeadingItem } from '../types';
import { marked } from 'marked';

export const isDev = () => process.env.NODE_ENV == 'development';

export const getAbsoultPath = (relativePath: string): string => {
  const cwd = process.cwd();
  return path.join(cwd, relativePath);
};

export const getRelativePath = (absoultPath: string): string => {
  const cwd = process.cwd();
  return path.relative(cwd, absoultPath);
};

export const getSlugParams = (indexPath: string) => {
  let baseName = path.basename(indexPath);
  // match slug params
  const regex = /([0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2})\-(.+)/;
  let match = baseName.match(regex);

  if (match) return { slugKey: match[2], slugDate: new Date(match[1]) };
  return { slugKey: baseName, slugDate: undefined };
};

export const getPageAttribute = async (body: string) => {
  // process fonrtmatter
  const matterObj = fm(body);
  let attributes: Record<string, any> = matterObj.attributes;

  if (typeof attributes['excerpt'] === 'undefined') {
    // if <!-- more --> exists will join it to frontmatter.
    let result = extractExcerpt(matterObj.body);
    if (result.excerpt != null) attributes['excerpt'] = result.excerpt;
  }

  let headings = extractHeading(matterObj.body);

  return {
    metadata: attributes,
    headings: headings
  };
};

export const extractBody = async (body: string): Promise<string> => {
  // loading markdown content.
  const matterObj = fm(body);
  let final = extractExcerpt(matterObj.body);
  // return body string.
  return final.body;
};

export const extractExcerpt = (body: string): { excerpt: string; body: string } => {
  const rExcerpt = /<!-- ?more ?-->/i;
  let result = { excerpt: null, body: body };

  if (!rExcerpt.test(body)) return result;

  result.body = body.replace(rExcerpt, (_, index) => {
    let substr = body.substring(0, index).trim();
    result.excerpt = removeMd(substr);
    return ``;
  });

  return result;
};

export const extractHeading = (body: string): Array<HeadingItem> => {
  const tree = marked.lexer(body);
  const result = [];
  tree.map((node) => {
    if (node.type == 'heading') {
      result.push({
        depth: node.depth,
        text: node.text,
        raw: node.raw,
        id: serializeId(node.text)
      });
    }
  });
  return result;
};

const serializeId = (value: string) => {
  return (
    value
      .toLowerCase()
      .trim()
      // remove html tags
      .replace(/<[!\/a-z].*?>/gi, '')
      // remove unwanted chars
      .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
      .replace(/\s/g, '-')
  );
};
