interface ContentMetadataProps {
    title: string;
    primaryKeyword: string;
    secondaryKeywords: string[];
    onTitleChange: (title: string) => void;
    onPrimaryKeywordChange: (keyword: string) => void;
    onSecondaryKeywordsChange: (keywords: string[]) => void;
}
export default function ContentMetadata({ title, primaryKeyword, secondaryKeywords, onTitleChange, onPrimaryKeywordChange, onSecondaryKeywordsChange }: ContentMetadataProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ContentMetadata.d.ts.map