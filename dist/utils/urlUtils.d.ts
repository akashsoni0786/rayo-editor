/**
 * Ensures URL has www and https protocol
 * @param url The URL to process
 * @returns The URL with www and https protocol
 */
export declare function formatGSCUrl(url: string): string;
/**
 * Test cases:
 * https://www.example.com/ → https://www.example.com
 * http://example.com/     → https://www.example.com
 * www.example.com        → https://www.example.com
 * example.com           → https://www.example.com
 */ 
//# sourceMappingURL=urlUtils.d.ts.map