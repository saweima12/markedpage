# MarkedPage

A Markdown provider for my svelte blog.

## How to use

1. Create **./src/site.config.js** to configure setting.  
```js
const config = {
  title: "TestWebSite",
  classifier: [
    { id: 'post', params: { path: '/_posts/' }, type: 'directory' },
    { id: 'tag', params: { keys: ['tag', 'tags'] }, type: 'frontmatter' }
  ],
  marked: {
    options: {},
    extensions: {}
  },
};

export default config;
```
2. Create **./docs** and put markdown files in it.
```
root
|_docs
    |_2022-04-28-post.md
```

3. Use **getPage** or **classifiedSet** to get page context or page list in endpoints.
```js
// example.ts
import type { DirectoryClassifierResult } from 'markedpage';
import { getPage, classifiedSet } from 'markedpage';
import type { RequestHandler } from '@sveltejs/kit';

export const get : RequestHandler = async () => {
  // Get list.
  const pageSet: DirectoryClassifierResult = await classifiedSet("post");
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
  }
}
```
