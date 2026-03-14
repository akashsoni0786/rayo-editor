/**
 * Cleans a domain string by removing protocol, www, and trailing slashes
 */
export function cleanDomain(url: string): string {
  try {
    // Remove protocol (http:// or https://)
    let domain = url.replace(/^(https?:\/\/)?(www\.)?/, '');
    
    // Remove trailing slashes and everything after
    domain = domain.split('/')[0];
    
    // Remove query parameters and hashes
    domain = domain.split('?')[0].split('#')[0];
    
    return domain.toLowerCase();
  } catch (error) {
    console.error('Error cleaning domain:', error);
    return url;
  }
}

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures a URL has a protocol
 */
export function ensureProtocol(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}
