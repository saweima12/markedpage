import { join } from 'path';
import { suite } from 'uvu';
import { loadConfig, getAvaliableSource, loadSourcePages } from '../src/source';
import { getAbsoultPath, getRelativePath  } from '../src/internal';

import * as assert from 'uvu/assert';


// define test suite.
const svxutils = suite('svxutils');

// define test_path
const _fixtures = join(__dirname, '_fixtures');

svxutils('it should be get project absoult path', async () => {

  const output = `${process.cwd()}/test`;
  const rtn = getAbsoultPath('/test');
  console.log(`\n${rtn}`);
  assert.type(rtn, 'string');
  assert.equal(output, rtn);

});

svxutils('it should be get realtive path', async() => {
  const output = "test";
  const rtn = getRelativePath(`${process.cwd()}/test`);
  assert.equal(output, rtn);
});


svxutils('loadConfig() function should be return site.config.js', async() => {
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
});

svxutils('getAvaliableSource() fucntion should be work.', async () => {
  const relative_path = getRelativePath(join(_fixtures, "/docs"));
  const rtn = await getAvaliableSource(relative_path);
  console.log(rtn)
  assert.type(rtn, 'object');
})

svxutils('loadSourcePages() function should be work.', async () => {
  const relative_path = getRelativePath(join(_fixtures, "/docs"));
  const rtn = await loadSourcePages(relative_path);
  console.log("result:", rtn);
  assert.type(rtn, 'object')
});


svxutils.run();
