import { TableOperation, DiffPair } from '../types/diff.types';
/**
 * Groups consecutive tables based on their positions
 * Tables are considered consecutive if the next table starts where the previous one ends
 */
export declare const groupConsecutiveTables: (tables: TableOperation[]) => TableOperation[][];
/**
 * Matches table deletions with corresponding insertions
 * Creates DiffPair objects showing the relationship between old and new tables
 */
export declare const matchTableReplacements: (deletions: TableOperation[], insertions: TableOperation[]) => DiffPair[];
//# sourceMappingURL=tableHandling.d.ts.map