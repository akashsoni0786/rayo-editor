import { default as React } from 'react';
/**
 * Converts an ISO 3166-1 alpha-2 country code to its emoji flag.
 * Example: "US" -> "🇺🇸", "IN" -> "🇮🇳"
 *
 * Each letter is offset to the Regional Indicator Symbol range (U+1F1E6..U+1F1FF).
 */
export declare function countryCodeToEmoji(code: string): string;
/**
 * Normalizes any country code format to alpha-2.
 * Handles: alpha-2 ("US"), alpha-3 ("USA"), lowercase ("us"), and special cases ("UK" -> "GB").
 */
export declare function normalizeToAlpha2(code: string): string;
/**
 * Gets the emoji flag for any country code format (alpha-2, alpha-3, lowercase).
 */
export declare function getEmojiFlag(code: string): string;
interface CountryFlagEmojiProps {
    code: string;
    className?: string;
    /** Font size for the emoji. Defaults to the size that matches the surrounding text. */
    size?: number;
}
/**
 * Renders a country flag emoji as a React component.
 * Drop-in replacement for react-world-flags and country-flag-icons.
 *
 * Usage:
 *   <CountryFlagEmoji code="US" />
 *   <CountryFlagEmoji code="USA" />         // alpha-3 works too
 *   <CountryFlagEmoji code="us" size={20} /> // case-insensitive
 */
export declare const CountryFlagEmoji: React.NamedExoticComponent<CountryFlagEmojiProps>;
export {};
//# sourceMappingURL=countryEmoji.d.ts.map