export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
}

export const strictUrlValidator = (url: string): ValidationResult => {
  if (!url.trim()) {
    return {
      isValid: false,
      error: 'URL is required'
    };
  }

  // Stricter regex pattern - ensures hyphens only inside domain parts, not at start/end
  const strictUrlPattern = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[a-zA-Z]{2}(-[a-zA-Z]{2})?)?\/?$/;
  
  // Add https:// if not present
  const normalizedUrl = url.toLowerCase().startsWith('http') ? url : `https://${url}`;
  
  if (!strictUrlPattern.test(normalizedUrl)) {
    return {
      isValid: false,
      error: 'Please enter a valid homepage URL (e.g., nike.com, store.nike.com/us)'
    };
  }

  try {
    const parsedUrl = new URL(normalizedUrl);
    
    // Additional checks for blocked domains
    if (parsedUrl.hostname === 'localhost' || 
        parsedUrl.hostname.endsWith('.local') || 
        parsedUrl.hostname.endsWith('.invalid') || 
        parsedUrl.hostname.endsWith('.test')) {
      return {
        isValid: false,
        error: 'Please enter a public website URL'
      };
    }

    return {
      isValid: true,
      normalizedUrl
    };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid website URL'
    };
  }
};

// Helper function to extract domain info
export const getDomainInfo = (url: string) => {
  try {
    const normalizedUrl = url.toLowerCase().startsWith('http') ? url : `https://${url}`;
    const parsedUrl = new URL(normalizedUrl);
    
    return {
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      pathname: parsedUrl.pathname,
      hasRegionCode: /^\/[a-zA-Z]{2}(-[a-zA-Z]{2})?\/?$/.test(parsedUrl.pathname)
    };
  } catch {
    return null;
  }
};