import type { SourcePage, ClassifierOptions } from '.';

export interface MarkedConfig {
    options: Record<string, any>;
    extensions: Array<any>;
}

export interface SiteConfigDefault extends Record<string, any> {
    extendPageData?: (pages: SourcePage) => Promise<void>;
    marked?: MarkedConfig;
    classifier?: Array<ClassifierOptions>;
}
  
export interface SourceParams extends Record<string, any> {
    sourcePath: string;
    indexPath: string;
    fullPath: string;
}
  