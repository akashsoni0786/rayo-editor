/**
 * Ensures URL has www and https protocol
 * @param url The URL to process
 * @returns The URL with www and https protocol
 */
export function formatGSCUrl(url: string): string {
  if (!url) return url;
  
  // Remove any existing protocol
  let formattedUrl = url.replace(/^(?:https?:\/\/)/i, '');
  
  // Add www if it doesn't exist
  if (!formattedUrl.startsWith('www.')) {
    formattedUrl = `www.${formattedUrl}`;
  }
  
  // Remove any trailing slashes
  formattedUrl = formattedUrl.replace(/\/+$/, '');
  
  // Add https protocol
  return `https://${formattedUrl}`;
}

/**
 * Test cases:
 * https://www.example.com/ → https://www.example.com
 * http://example.com/     → https://www.example.com
 * www.example.com        → https://www.example.com
 * example.com           → https://www.example.com
 */