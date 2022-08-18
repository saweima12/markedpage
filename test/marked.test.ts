import fs from 'fs';
import { join } from 'path';
import { suite } from 'uvu';
import { getConfig, getPageMap, reloadSourcePage } from '../src/source';
import { getAbsoultPath, getRelativePath } from '../src/internal';
import { getClassifiedResult, initClassifierMap } from '../src/classifier';

import * as assert from 'uvu/assert';
import { DirectoryClassifierResult } from '../src/classifier/directory';

const _DEBUG = false;
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
    console.log('AbsoultPath - ', `${rtn}`);
  }
});

marked('it should be get realtive path', async () => {
  const output = 'test';
  const rtn = getRelativePath(`${process.cwd()}/test`);
  assert.equal(output, rtn);
  if (_DEBUG) {
    console.log('RelativePath -', `${rtn}`);
  }
});

marked('loadConfig() function should be return site.config.js', async () => {
  const output = {
    title: 'TestWebsite',
    classifier: [{ id: 'post', params: { path: '/posts/' }, type: 'directory' }]
  };

  const relative_path = getRelativePath(join(_fixtures, 'site.config.js'));
  const rtn = await getConfig(relative_path);
  assert.equal(output.title, rtn.title);

  if (_DEBUG) {
    console.log('SiteConfig:', rtn);
  }
});

marked('getPageMap() function should be work.', async () => {
  // define test path
  const relative_path = getRelativePath(join(_fixtures, '/docs'));
  process.env.NODE_ENV = 'production';
  const config_relative_path = getRelativePath(join(_fixtures, 'site.config.js'));
  const config = await getConfig(config_relative_path);

  const rtn = await getPageMap(config, relative_path);
  if (_DEBUG) {
    console.log('Map:', rtn);
  }
  assert.type(rtn, 'object');
});

marked('loadPage function should be work.', async () => {
  // define test path
  const relative_path = getRelativePath(join(_fixtures, '/docs'));

  const config_relative_path = getRelativePath(join(_fixtures, 'site.config.js'));
  const config = await getConfig(config_relative_path);

  const rtn = await getPageMap(config, relative_path);

  let page = rtn.slugMap['directorypost1'][0];
  const content = await page.render();

  if (_DEBUG) {
    console.log('\nPage Render:', content);
  }
});

marked('getClassifierSet should be work', async () => {
  // define test path
  const relative_path = getRelativePath(join(_fixtures, '/docs'));
  process.env.NODE_ENV = 'production';
  const config_relative_path = getRelativePath(join(_fixtures, 'site.config.js'));
  const config = await getConfig(config_relative_path);

  // initialize classifierMap & pageMap.
  await initClassifierMap(config.classifier || []);
  const pageMap = await getPageMap(config, relative_path);
  const pageList = Object.values(pageMap.pathMap);

  // postSet
  const result: DirectoryClassifierResult = await getClassifiedResult('post', pageList);
  assert.equal(result.pages.length, 1);
});

marked('reloadSourcePage should be work', async () => {
  // define test path
  const relative_path = getRelativePath(join(_fixtures, '/docs'));
  process.env.NODE_ENV = 'production';
  const config_relative_path = getRelativePath(join(_fixtures, 'site.config.js'));
  const config = await getConfig(config_relative_path);

  // getPage.
  const rtn = await getPageMap(config, relative_path);
  let page = rtn.slugMap['directorypost1'][0];

  let temp = await fs.promises.readFile(getAbsoultPath(page.sourcePath));
  let content = await temp.toString();

  const pageStruct = await reloadSourcePage(config, page.sourcePath, content);

  if (_DEBUG) {
    console.log(pageStruct);
  }
});

marked.run();
