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
/
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
<!-- 2022-04-28-firstpage.md -->

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

## Markdown Vite HMR Support 

- Add `markedpageVitePlugin()` to config.plugins
```js
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { markedpageVitePlugin } from 'markedpage';

import siteConfig from './src/site.config.js';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), markedpageVitePlugin(siteConfig)]
};

export default config;
```

- Listen to onContentUpdate and update the endpoint with invalidate.
```js
// src/routes/
<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { onContentUpdate } from 'markedpage';

    onContentUpdate((payload) => {
        let slug = $page.params.slug;
        // update endpoint data.
        invalidate(`/api/posts.json`);
        invalidate(`/api/posts/${slug}.json`);
    });
</script>
```

## Example

https://github.com/saweima12/markedpage-example

## ChangeLog
- [2022-08-18] v0.1.11 - Optimize markdown file reload.
- [2022-07-22] v0.1.10 - Fix: marked config is not loaded properly
- [2022-07-22] v0.1.8 - Add support for site.config.js auto-reload via configuration 
- [2022-07-18] v0.1.7 - Replace chalk.js with kleur
- [2022-07-16] v0.1.5 - Add markdown file Vite HMR Support.
- [2022-05-31] Add `_draft` field support in FrontMatter.(It will not be added to list in production)
- [2022-05-27] Add extendPageData support
