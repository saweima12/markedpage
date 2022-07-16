import path from 'path';
import type { HmrContext, Plugin, InferCustomEventPayload } from 'vite';

import { initClassifierMap } from './classifier';
import { getConfig, loadConfig, loadSourcePages } from './source';

const CONTENT_UPDATE_EVENT = "markedpage:content-update"
const SITECONFIG_UPDATE_EVENT = "markedpage:config-update"

export const onContentUpdate = (callback: (payload: Record<string, any>) => void) => {
  if (import.meta.hot) {
    import.meta.hot.on(CONTENT_UPDATE_EVENT, callback)
  }
}

export const onSiteConfigUpdate = (callback: (payload: Record<string, any>) => void) => {
  if (import.meta.hot) {
    import.meta.hot.on(SITECONFIG_UPDATE_EVENT, callback)
  }
}

export const markedpageVitePlugin: Plugin = () => {
  
  return {
    name: 'markedpage-watch-docs',
    configureServer(server) {
      // add watch path "${project_root}/docs"
      server.watcher.add(path.join(process.cwd(), "docs"));
      server.watcher.add(path.join(process.cwd(), "/src/site.config.js"));
    },
    async handleHotUpdate(ctx: HmrContext) {
      const content_match = /\/docs\/(.+)\.md$/.exec(ctx.file);
      const config_match = /\/site.config.js/.exec(ctx.file);
      // didn't match, use default behavior.
      if (content_match) {
        await onContentMatch(ctx, content_match[0], content_match[1]);
        return [];
      }

      if (config_match) {
        await onConfigMatch(ctx)
        return [];
      }

      return ctx.modules
    }
  }
};


const onContentMatch = async(ctx: HmrContext, filePath:string, indexPath:string) => {
  const config = await getConfig();

  // update pageMap & classiferMap
  await loadSourcePages(config);
  initClassifierMap(config.classifier || []);

  // update client
  ctx.server.ws.send({
    type: "custom",
    event: "markedpage:content-update",
    data: {
      filePath: filePath,
      indexPath: indexPath
    }
  });
}

const onConfigMatch = async (ctx: HmrContext) => {
  // update client
  console.info(`site.config changed: restarting vite server. - file: ${ctx.file}`);
  ctx.server.restart()
}