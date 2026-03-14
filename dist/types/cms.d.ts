export type CMSType = 'wordpress';
export interface WordPressConfig {
    url: string;
    username: string;
    password: string;
    apiKey?: string;
}
export interface CMSConfig {
    type: CMSType;
    config: WordPressConfig;
}
//# sourceMappingURL=cms.d.ts.map