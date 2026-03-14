export interface Country {
    name: string;
    code: string;
}
export interface Project {
    id: string;
    user_id: string;
    name: string;
    url: string;
    description?: string;
    visitors: number;
    audience: string;
    services: string[];
    created_at: string;
    updated_at: string;
}
export interface KeywordMetrics {
    keyword: string;
    search_volume: number;
    keyword_difficulty: number;
    cpc: number;
    competition: number;
    results_count: number;
    trends?: number[];
    volume?: number;
    difficulty?: number;
}
export interface KeywordSuggestion {
    keyword: string;
    metrics?: KeywordMetrics;
}
export interface SemrushResponse {
    data: KeywordMetrics[];
    error?: string;
}
export interface CountrySelectorProps {
    selectedCountry: string;
    onCountryChange: (country: string) => void;
}
export interface KeywordTableProps {
    keywords: KeywordMetrics[];
    loading?: boolean;
    onKeywordSelect?: (keyword: string) => void;
}
export interface OutlineSection {
    heading: string;
    subheadings: string[];
}
export interface ProjectState {
    projects: Project[];
    currentProject: Project | null;
    loading: boolean;
    error: string | null;
    getProject: (id: string) => Project | undefined;
}
export interface KeywordState {
    keywords: KeywordMetrics[];
    selectedKeyword: string | null;
    loading: boolean;
    error: string | null;
}
export interface BlogOutline {
    introduction: string;
    sections: OutlineSection[];
    conclusion: string;
    title?: string;
}
export interface BlogPost {
    id: string;
    title: string;
    content: string;
    outline: BlogOutline;
    primaryKeyword: string;
    secondaryKeywords: string[];
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=index.d.ts.map