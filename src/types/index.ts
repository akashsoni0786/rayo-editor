// Country Types
export interface Country {
  name: string;
  code: string;
}

// Project Types
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

// Keyword Types
export interface KeywordMetrics {
  keyword: string;
  search_volume: number;
  keyword_difficulty: number;
  cpc: number;
  competition: number;
  results_count: number;
  trends?: number[];
  volume?: number; // alias for search_volume
  difficulty?: number; // alias for keyword_difficulty
}

export interface KeywordSuggestion {
  keyword: string;
  metrics?: KeywordMetrics;
}

// SEMrush API Response Types
export interface SemrushResponse {
  data: KeywordMetrics[];
  error?: string;
}

// Component Props Types
export interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

export interface KeywordTableProps {
  keywords: KeywordMetrics[];
  loading?: boolean;
  onKeywordSelect?: (keyword: string) => void;
}

// Store Types
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

// Blog Types
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
