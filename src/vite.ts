import type { Plugin } from 'vite';

export const watchDocs: Plugin = {
  name: 'watch-docs',
  configureServer(server) {
    server.watcher.add(path.join());
  }
};
