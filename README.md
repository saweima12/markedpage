# MarkedPage

A Markdown provider for my sveltekit static blog.

## Features

- Markdown source provide
- Customize Classification
- Support `<!-- more -->` tag, it will add excerpt into frontmatter
- Use marked to parse markdown context.

## Usage

1. Create **./src/site.config.js** to configure setting.

```js
const config = {
  title: 'TestWebSite',
  classifier: [
    { id: 'post', params: { path: '/_posts/' }, type: 'directory' },
    { id: 'tag', params: { keys: ['tag', 'tags'] }, type: 'frontmatter' }
  ],
  marked: {
    options: {},
    extensions: {}
  }
};

export default config;
```

2. Create **./docs/\_posts/2022-04-28-post1.md** and put markdown files in it.

```
root
|_docs
  |_posts
    |_2022-04-28-post1.md
```

3. Use **getPage** or **classifiedSet** to get page context or page list in endpoints.

```js
// example.ts
import type { DirectoryClassifierResult } from 'markedpage';
import { getPage, classifiedSet } from 'markedpage';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async () => {
  // Get list.
  const pageSet: DirectoryClassifierResult = await classifiedSet('post');
  const pages = pageSet.pages;
  // Get page.
  const page = await getPage('post1');
  const context = await page.render();

  return {
    body: {
      pages: pages,
      metadata: page.frontMatter,
      body: context
    }
  };
};
```

## Example

```md
## <!-- 2022-04-28-firstpage.md -->

title: FirstPost
tags:

- test

---

This is summary field.

<!-- more -->

This is context block.
```

It will be passed to

```
{
  frontMatter: {
    title: 'FirstPost',
    tags: [ 'test' ],
    excerpt: 'This is summary field.',
    created: 2022-04-28T00:00:00.000Z
  },
  sourcePath: 'docs/2022-04-28-firstpage.md',
  indexPath: 'docs/2022-04-28-firstpage',
  render: [Function: render],
  raw: [Function: raw],
  slugKey: 'firstpage'
}
```

## ChangeLog
- 2022-05-31 Add `_draft` field support in FrontMatter.(It will not be added to list in production)
- 2022-05-27 Add extendPageData support
