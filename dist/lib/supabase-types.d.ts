export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export interface Database {
    public: {
        Tables: {
            projects: {
                Row: {
                    id: string;
                    created_at: string;
                    name: string;
                    url: string;
                    visitors: number;
                    audience: string;
                    services: string[];
                    user_id: string;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    name: string;
                    url: string;
                    visitors?: number;
                    audience: string;
                    services?: string[];
                    user_id: string;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    name?: string;
                    url?: string;
                    visitors?: number;
                    audience?: string;
                    services?: string[];
                    user_id?: string;
                };
            };
        };
    };
}
//# sourceMappingURL=supabase-types.d.ts.map