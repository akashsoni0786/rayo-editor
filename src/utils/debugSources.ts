// Debug utility for sources cache analysis
export const debugSourcesCache = (projectId: string) => {
  const allKeys = Object.keys(localStorage);
  const sourcesKeys = allKeys.filter(key => 
    key.includes('sources_') && key.includes(projectId)
  );
  
  console.log('🔍 [Debug] Sources cache analysis for project:', projectId);
  console.log('📋 [Debug] Found cache keys:', sourcesKeys);
  
  sourcesKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        const size = (data.length / 1024).toFixed(2);
        
        console.log(`🔑 [Debug] Key: ${key}`);
        console.log(`📏 [Debug] Size: ${size}KB`);
        
        // Advanced Cache format
        if (parsed.data && parsed.data.outline && Array.isArray(parsed.data.outline)) {
          const sourcesCount = parsed.data.outline.reduce((total: number, section: any) => {
            let count = section.sources?.length || 0;
            if (section.children) {
              count += section.children.reduce((childTotal: number, child: any) => 
                childTotal + (child.sources?.length || 0), 0);
            }
            return total + count;
          }, 0);
          
          console.log(`📊 [Debug] Advanced Cache - Sections: ${parsed.data.outline.length}, Sources: ${sourcesCount}`);
          console.log(`👤 [Debug] Custom sources: ${parsed.userInteractions?.customSources?.length || 0}`);
        }
        
        // Collection Cache format
        if (parsed.data && parsed.data.data && parsed.data.data.outline) {
          console.log(`📊 [Debug] Collection Cache - Sources collected: ${parsed.data.data.sources_collected || 0}`);
        }
        
        console.log('---');
      }
    } catch (error) {
      console.warn(`❌ [Debug] Failed to parse ${key}:`, error);
    }
  });
  
  return sourcesKeys;
};

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).debugSourcesCache = debugSourcesCache;
} 