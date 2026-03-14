import { Node } from '@tiptap/core';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        instagramEmbed: {
            setInstagramEmbed: (options: {
                src: string;
            }) => ReturnType;
        };
        twitterEmbed: {
            setTwitterEmbed: (options: {
                src: string;
            }) => ReturnType;
        };
        facebookEmbed: {
            setFacebookEmbed: (options: {
                src: string;
            }) => ReturnType;
        };
    }
}
export declare const getInstagramId: (url: string | null | undefined) => string | null;
export declare const getTwitterId: (url: string | null | undefined) => string | null;
export declare const getFacebookEmbedUrl: (url: string) => string | null;
export declare const getEmbedType: (url: string) => "youtube" | "instagram" | "twitter" | "facebook" | null;
export declare const InstagramEmbed: Node<any, any>;
export declare const getTwitterUsername: (url: string | null | undefined) => string | null;
export declare const TwitterEmbed: Node<any, any>;
export declare const FacebookEmbed: Node<any, any>;
export declare const EmbedExtensions: Node<any, any>[];
//# sourceMappingURL=EmbedExtension.d.ts.map