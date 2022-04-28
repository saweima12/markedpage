import { join } from 'path';
import { suite } from 'uvu';
import { loadConfig, loadSourcePages } from '../src/source';
import { getAbsoultPath, getRelativePath  } from '../src/internal';

import * as assert from 'uvu/assert';


const _DEBUG = false
// define test suite.
const marked = suite('marked');

// define test_path
const _fixtures = join(__dirname, '_fixtures');

marked('it should be get project absoult path', async () => {

  const output = `${process.cwd()}/test`;
  const rtn = getAbsoultPath('/test');
  assert.type(rtn, 'string');
  assert.equal(output, rtn);

  if (_DEBUG) {
    console.log(`\n${rtn}`);
  }
});

marked('it should be get realtive path', async() => {
  const output = "test";
  const rtn = getRelativePath(`${process.cwd()}/test`);
  assert.equal(output, rtn);
});


marked('loadConfig() function should be return site.config.js', async() => {
  const output = {
    title: "TestWebsite",
    classifier : [
      { id: "post", params: { path: "/posts/" }, type: "directory"  },
    ]
  }
    
  const relative_path = getRelativePath(join(_fixtures, "site.config.js"));
  const rtn = await loadConfig(relative_path);
  assert.equal(output.title, rtn.title);
  assert.equal(output.classifier[0].id, rtn.classifier[0].id);
  if (_DEBUG) {
    console.log("SiteConfig:", rtn);
  }
});


marked('loadSourcePages() function should be work.', async () => {
  const relative_path = getRelativePath(join(_fixtures, "/docs"));
  const rtn = await loadSourcePages(relative_path);

  if (_DEBUG) {
    console.log("Map:", rtn);
  }
  assert.type(rtn, 'object')
});


marked('loadPage function should be work.', async () => {
  const relative_path = getRelativePath(join(_fixtures, "/docs"));
  const rtn = await loadSourcePages(relative_path);
  
  let page = rtn.slugMap['directorypost1'][0]
  const context = await page.render();
  
  console.log(context)

  if (_DEBUG) {
    console.log("\nPage Render:", await page.render())
  }
});

marked.run();
