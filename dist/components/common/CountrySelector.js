import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CountryFlagEmoji } from '@/utils/countryEmoji';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
// Complete list of SEMrush database countries
// code = ISO code (for flag display), apiCode = SEMrush API code (only where different from ISO)
const countries = [
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AL', name: 'Albania' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AT', name: 'Austria' },
    { code: 'AU', name: 'Australia' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'BA', name: 'Bosnia and Herzegovina' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BR', name: 'Brazil' },
    { code: 'BY', name: 'Belarus' },
    { code: 'CA', name: 'Canada' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' },
    { code: 'CO', name: 'Colombia' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'DE', name: 'Germany' },
    { code: 'DK', name: 'Denmark' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'EE', name: 'Estonia' },
    { code: 'EG', name: 'Egypt' },
    { code: 'ES', name: 'Spain' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'GB', name: 'United Kingdom', apiCode: 'UK' }, // ISO: GB, SEMrush: UK
    { code: 'GE', name: 'Georgia' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GR', name: 'Greece' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HR', name: 'Croatia' },
    { code: 'HU', name: 'Hungary' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IL', name: 'Israel' },
    { code: 'IN', name: 'India' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'IR', name: 'Iran' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IT', name: 'Italy' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JO', name: 'Jordan' },
    { code: 'JP', name: 'Japan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'KR', name: 'South Korea' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'LA', name: 'Laos' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'LV', name: 'Latvia' },
    { code: 'MA', name: 'Morocco' },
    { code: 'MD', name: 'Moldova' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MK', name: 'North Macedonia' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'MT', name: 'Malta' },
    { code: 'MX', name: 'Mexico' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NO', name: 'Norway' },
    { code: 'NP', name: 'Nepal' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'OM', name: 'Oman' },
    { code: 'PA', name: 'Panama' },
    { code: 'PE', name: 'Peru' },
    { code: 'PH', name: 'Philippines' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PL', name: 'Poland' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'PT', name: 'Portugal' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'QA', name: 'Qatar' },
    { code: 'RO', name: 'Romania' },
    { code: 'RS', name: 'Serbia' },
    { code: 'RU', name: 'Russia' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SE', name: 'Sweden' },
    { code: 'SG', name: 'Singapore' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'TH', name: 'Thailand' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'TR', name: 'Turkey' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'US', name: 'United States' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'YE', name: 'Yemen' },
    { code: 'ZA', name: 'South Africa' }
].sort((a, b) => a.name.localeCompare(b.name));
// Map API codes (lowercase) back to ISO codes for flag display
const apiToIsoMap = {
    'uk': 'GB', // SEMrush uses 'uk', ISO uses 'GB'
};
export default function CountrySelector({ selectedCountry, onCountryChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    // Convert API code to ISO code if needed (e.g., 'uk' -> 'GB')
    const normalizedSelectedCountry = selectedCountry.toUpperCase();
    const isoCode = apiToIsoMap[selectedCountry.toLowerCase()] || normalizedSelectedCountry;
    // Find country by ISO code OR by apiCode
    const selectedCountryData = countries.find(country => country.code === isoCode ||
        (country.apiCode && country.apiCode.toUpperCase() === normalizedSelectedCountry));
    const selectedCountryName = selectedCountryData?.name || 'Select Country';
    const flagCode = selectedCountryData ? selectedCountryData.code : 'IN';
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const filteredCountries = countries.filter(country => country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (country.apiCode && country.apiCode.toLowerCase().includes(searchQuery.toLowerCase())));
    const toggleDropdown = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: 256 // w-64 = 256px
            });
        }
        setIsOpen(!isOpen);
    };
    const handleCountrySelect = (country) => {
        // Use apiCode for API calls if available, otherwise use ISO code
        const codeForApi = country.apiCode || country.code;
        console.log('CountrySelector - Selected country:', codeForApi, '(ISO:', country.code, ')');
        onCountryChange(codeForApi.toLowerCase());
        setIsOpen(false);
        setSearchQuery('');
    };
    const dropdownContent = isOpen ? (_jsxs("div", { ref: dropdownRef, className: "fixed z-[9999999] w-64 max-h-48 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg", style: {
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width
        }, children: [_jsx("div", { className: "p-1.5", children: _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search countries...", className: "w-full h-7 px-2 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6938EF] focus:border-transparent" }) }), _jsx("div", { className: "py-1", children: filteredCountries.map((country) => (_jsxs("button", { onClick: () => handleCountrySelect(country), className: "w-full px-2.5 py-1 flex items-center gap-2 hover:bg-gray-50 text-[13px]", children: [_jsx(CountryFlagEmoji, { code: country.code, size: 14 }), _jsx("span", { className: "truncate", children: country.name })] }, country.code))) })] })) : null;
    return (_jsxs(_Fragment, { children: [_jsxs("button", { ref: buttonRef, onClick: toggleDropdown, className: "w-full h-8 px-1 flex items-center justify-between gap-0.5 text-[13px] focus:outline-none", children: [_jsx("div", { className: "flex items-center gap-2 min-w-0", children: _jsx("span", { className: "truncate text-[#182234] text-[14px] font-inter font-semibold leading-[21px]", style: { wordWrap: 'break-word' }, children: selectedCountryName }) }), isOpen ? (_jsx(ChevronUpIcon, { className: "h-3.5 w-3.5 text-gray-500" })) : (_jsx(ChevronDownIcon, { className: "h-3.5 w-3.5 text-gray-500" }))] }), typeof document !== 'undefined' && dropdownContent && createPortal(dropdownContent, document.body)] }));
}
//# sourceMappingURL=CountrySelector.js.map