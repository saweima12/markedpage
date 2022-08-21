import { CONTENT_UPDATE_EVENT } from './common';

/** @internal */
export const onContentUpdate = (callback: (payload: Record<string, any>) => void) => {
  if (import.meta.hot) {
    import.meta.hot.on(CONTENT_UPDATE_EVENT, callback);
  }
};
