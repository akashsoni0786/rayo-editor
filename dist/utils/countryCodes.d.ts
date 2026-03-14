interface CountryCode {
    code: string;
    name: string;
    dial_code: string;
}
/**
 * Complete list of countries with their ISO codes and phone dial codes
 * Sorted alphabetically by country name
 */
export declare const countryCodes: CountryCode[];
/**
 * Get a list of popular/common country codes
 * @returns A subset of popular country codes
 */
export declare function getPopularCountryCodes(): CountryCode[];
export default countryCodes;
//# sourceMappingURL=countryCodes.d.ts.map