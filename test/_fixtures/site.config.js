const config = {
  title: 'TestWebsite',
  classifier: [
    { id: 'post', params: { path: '/posts/' }, type: 'directory' },
    { id: 'tag', params: { keys: ['tags'] }, type: 'frontmatter' }
  ],
  extendPageData: (page) => {console.log(page);},
  marked: {
    options: {},
    extensions: []
  }
};

export default config;
