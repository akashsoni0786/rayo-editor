import React, { memo } from 'react';

/**
 * Converts an ISO 3166-1 alpha-2 country code to its emoji flag.
 * Example: "US" -> "🇺🇸", "IN" -> "🇮🇳"
 *
 * Each letter is offset to the Regional Indicator Symbol range (U+1F1E6..U+1F1FF).
 */
export function countryCodeToEmoji(code: string): string {
  const upper = code.toUpperCase();
  if (upper.length !== 2) return '';
  const first = upper.charCodeAt(0);
  const second = upper.charCodeAt(1);
  if (first < 65 || first > 90 || second < 65 || second > 90) return '';
  return String.fromCodePoint(0x1f1e6 + first - 65, 0x1f1e6 + second - 65);
}

// Common alpha-3 to alpha-2 mappings used in this codebase (GSC, SEMrush, etc.)
const ALPHA3_TO_ALPHA2: Record<string, string> = {
  AFG: 'AF', ALB: 'AL', DZA: 'DZ', ARG: 'AR', ARM: 'AM', AUS: 'AU', AUT: 'AT',
  AZE: 'AZ', BHR: 'BH', BGD: 'BD', BLR: 'BY', BEL: 'BE', BOL: 'BO', BIH: 'BA',
  BRA: 'BR', BGR: 'BG', KHM: 'KH', CAN: 'CA', CHL: 'CL', CHN: 'CN', COL: 'CO',
  CRI: 'CR', HRV: 'HR', CYP: 'CY', CZE: 'CZ', DNK: 'DK', DOM: 'DO', ECU: 'EC',
  EGY: 'EG', SLV: 'SV', EST: 'EE', FIN: 'FI', FRA: 'FR', GEO: 'GE', DEU: 'DE',
  GHA: 'GH', GRC: 'GR', GTM: 'GT', HKG: 'HK', HND: 'HN', HUN: 'HU', ISL: 'IS',
  IND: 'IN', IDN: 'ID', IRN: 'IR', IRQ: 'IQ', IRL: 'IE', ISR: 'IL', ITA: 'IT',
  JAM: 'JM', JPN: 'JP', JOR: 'JO', KAZ: 'KZ', KEN: 'KE', KWT: 'KW', LAO: 'LA',
  LVA: 'LV', LBN: 'LB', LTU: 'LT', LUX: 'LU', MYS: 'MY', MLT: 'MT', MEX: 'MX',
  MDA: 'MD', MNG: 'MN', MNE: 'ME', MAR: 'MA', MMR: 'MM', NPL: 'NP', NLD: 'NL',
  NZL: 'NZ', NIC: 'NI', NGA: 'NG', MKD: 'MK', NOR: 'NO', OMN: 'OM', PAK: 'PK',
  PAN: 'PA', PRY: 'PY', PER: 'PE', PHL: 'PH', POL: 'PL', PRT: 'PT', PRI: 'PR',
  QAT: 'QA', ROU: 'RO', RUS: 'RU', SAU: 'SA', SRB: 'RS', SGP: 'SG', SVK: 'SK',
  SVN: 'SI', ZAF: 'ZA', KOR: 'KR', ESP: 'ES', LKA: 'LK', SWE: 'SE', CHE: 'CH',
  TWN: 'TW', THA: 'TH', TUN: 'TN', TUR: 'TR', ARE: 'AE', UKR: 'UA', GBR: 'GB',
  USA: 'US', URY: 'UY', UZB: 'UZ', VEN: 'VE', VNM: 'VN', YEM: 'YE',
};

/**
 * Normalizes any country code format to alpha-2.
 * Handles: alpha-2 ("US"), alpha-3 ("USA"), lowercase ("us"), and special cases ("UK" -> "GB").
 */
export function normalizeToAlpha2(code: string): string {
  const upper = code.toUpperCase();
  if (upper === 'UK') return 'GB';
  if (upper.length === 2) return upper;
  if (upper.length === 3) return ALPHA3_TO_ALPHA2[upper] || upper.slice(0, 2);
  return upper;
}

/**
 * Gets the emoji flag for any country code format (alpha-2, alpha-3, lowercase).
 */
export function getEmojiFlag(code: string): string {
  return countryCodeToEmoji(normalizeToAlpha2(code));
}

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
export const CountryFlagEmoji = memo(function CountryFlagEmoji({
  code,
  className,
  size,
}: CountryFlagEmojiProps) {
  const emoji = getEmojiFlag(code);
  if (!emoji) return null;

  return (
    <span
      className={className}
      role="img"
      aria-label={`Flag of ${normalizeToAlpha2(code)}`}
      style={{
        fontSize: size,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {emoji}
    </span>
  );
});
