import path from 'path';
import type { HmrContext, Plugin } from 'vite';

import { initClassifierMap } from '../classifier';
import { getConfig, setConfig, reloadSourcePage } from '../sources';
import { CONTENT_UPDATE_EVENT } from './common';

export const markedpageVitePlugin = (siteConfig?: Record<string, any>): Plugin => {
  return {
    name: 'markedpage-watch-docs',
    configResolved(config) {
      if (siteConfig) setConfig(siteConfig);
    },
    configureServer(server) {
      // add watch path "${project_root}/docs"
      server.watcher.add(path.join(process.cwd(), 'docs'));
    },
    async handleHotUpdate(ctx: HmrContext) {
      const content_match = /\/docs\/(.+)\.md$/.exec(ctx.file);
      // didn't match, use default behavior.
      if (content_match) {
        const content = await ctx.read();
        await onContentMatch(ctx, content_match[0], content);
        return [];
      }

      return ctx.modules;
    }
  };
};

const onContentMatch = async (ctx: HmrContext, sourcePath: string, content: string) => {
  const config = await getConfig();

  // clean console message.
  console.clear();
  // update pageMap & classiferMap
  await reloadSourcePage(config, sourcePath, content);
  await initClassifierMap(config.classifier || []);

  // update client
  ctx.server.ws.send({
    type: 'custom',
    event: CONTENT_UPDATE_EVENT,
    data: {
      sourcePath: sourcePath
    }
  });
};
