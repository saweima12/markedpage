import { cyan, green } from 'kleur'
const prefix = 'vite:markedpage';

export const logger = {
  debug: (message:any, ...options: any[]) => _log(console.debug, message, ...options),
  warn: (message:any, ...options: any[]) => _log(console.warn, message, ...options),
  error: (message:any, ...options: any[]) => _log(console.error, message, ...options),
  info: (message:any, ...options: any[]) => _log(console.info, message, ...options)
};

const _prefixMsg = () => {
  return `[${green(getCurrentTime())}][${cyan(prefix)}]`;
};

const _log = (func, message: any, ...options:any[]) => {
  func(_prefixMsg(), message, ...options);
}

const getCurrentTime = () => {
  const time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(11);
  return time;
};
