const config = {
  title: "TestWebsite",
  classifier : [
    { id: "post", params: { path: "/posts/" }, type: "directory"  },
    { id: "tag", params: { keys: ["tags"] }, type: "frontmatter" },
  ],
}


export default config;
