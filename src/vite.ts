import path from 'path';
import type { HmrContext, Plugin } from 'vite';

import { initClassifierMap } from './classifier';
import { getConfig, setConfig, initPageMap } from './source';
import { logger } from './log';


const CONTENT_UPDATE_EVENT = 'markedpage:content-update';

export const onContentUpdate = (callback: (payload: Record<string, any>) => void) => {
  if (import.meta.hot) {
    import.meta.hot.on(CONTENT_UPDATE_EVENT, callback);
  }
};

export const markedpageVitePlugin = (siteConfig?: Record<string, any>): Plugin => {
  return {
    name: 'markedpage-watch-docs',
    configResolved(config) {
      if (siteConfig) 
        setConfig(siteConfig);
    },
    configureServer(server) {
      // add watch path "${project_root}/docs"
      server.watcher.add(path.join(process.cwd(), 'docs'));
    },
    async handleHotUpdate(ctx: HmrContext) {
      const content_match = /\/docs\/(.+)\.md$/.exec(ctx.file);
      // didn't match, use default behavior.
      if (content_match) {
        await onContentMatch(ctx, content_match[0], content_match[1]);
        return [];
      }

      return ctx.modules;
    }
  };
};

const onContentMatch = async (ctx: HmrContext, filePath: string, indexPath: string) => {
  const config = await getConfig();

  // update pageMap & classiferMap
  await initPageMap(config);
  await initClassifierMap(config.classifier || []);

  // print message
  console.clear();
  logger.info(`detect file change: ${indexPath}, reload pageMap.`);

  // update client
  ctx.server.ws.send({
    type: 'custom',
    event: 'markedpage:content-update',
    data: {
      filePath: filePath,
      indexPath: indexPath
    }
  });
};
