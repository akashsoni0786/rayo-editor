// @ts-nocheck
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { tokenManager } from '../../../auth/tokenManager';

interface UseAICompletionOptions {
  onResponse?: (response: Response) => void;
  onError?: (error: Error) => void;
}

interface AICompletionRequest {
  option: string;
  command?: string;
  projectId?: string;
  beforeContext?: string;
  afterContext?: string;
}

export function useAICompletion(options: UseAICompletionOptions = {}) {
  const [completion, setCompletion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const resetCompletion = () => {
    setCompletion('');
    setIsLoading(false);
    setIsStreaming(false);
    setError(null);
  };

  // Global reset function for external triggers
  const forceReset = () => {
    // Force stop any ongoing streaming
    setIsStreaming(false);
    setIsLoading(false);
    setCompletion('');
    setError(null);
  };

  const getBackendEndpoint = (option: string, projectId: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    switch (option) {
      case 'table':
        return `${baseUrl}/api/v1/projects/${projectId}/convert-to-table/stream`;
      case 'shorter':
        return `${baseUrl}/api/v1/projects/${projectId}/text-shortening/stream`;
      case 'list':
        return `${baseUrl}/api/v1/projects/${projectId}/convert-to-list/stream`;
      case 'continue':
      case 'zap':
      case 'improve':
      case 'fix':
      default:
        // For now, use text-shortening for other options until you have specific endpoints
        return `${baseUrl}/api/v1/projects/${projectId}/text-shortening/stream`;
    }
  };

  const complete = useCallback(async (prompt: string, requestData: { body: AICompletionRequest }) => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setCompletion('');

    try {
      const tokens = tokenManager.getTokens();
      if (!tokens?.access_token) {
        throw new Error('No access token available. Please log in.');
      }

      // Extract project ID from URL or request data
      const projectId = requestData.body.projectId || window.location.pathname.split('/')[2];
      if (!projectId) {
        throw new Error('Project ID not found. Please navigate to a project.');
      }

      const { option, command, beforeContext, afterContext } = requestData.body;
      const endpoint = getBackendEndpoint(option, projectId);

      // Prepare enhanced request payload with context for backend
      const payload = {
        text_to_edit: prompt,
        primary_keyword: command || '', // Use command as primary_keyword if provided
        before_context: beforeContext || '', // Context before selected text (max 50 words)
        after_context: afterContext || '', // Context after selected text (max 50 words)
      };

      console.log(`🚀 [AI] Making request to: ${endpoint}`);
      console.log(`📝 [AI] Enhanced Payload with Context:`, {
        ...payload,
        contextSummary: {
          beforeWords: (beforeContext || '').trim().split(/\s+/).filter(w => w.length > 0).length,
          afterWords: (afterContext || '').trim().split(/\s+/).filter(w => w.length > 0).length,
          selectedWords: prompt.trim().split(/\s+/).filter(w => w.length > 0).length
        }
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('You have reached your request limit for the day.');
        }
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      // Handle streaming response from backend
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      
      setIsStreaming(true);
      
      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data.trim() === '') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  
                  // Debug logging for table and list conversion to see field names
                  if ((option === 'table' || option === 'list') && parsed.event === 'chunk_stream_content') {
                    console.log(`🔍 [${option.toUpperCase()} Debug] Parsed data:`, parsed);
                  }
                  
                  // Handle different event types from your backend
                  if (parsed.event === 'chunk_stream_content') {
                    // Build typing animation using content_piece for live streaming
                    const contentPiece = parsed.content_piece || '';
                    
                    if (contentPiece) {
                      if (option === 'table') {
                        // For table conversion, accumulate the content pieces
                        accumulatedContent += contentPiece;
                        
                        // Try different possible field names for table content
                        let tableContent = '';
                        
                        // Check for various possible field names your backend might use
                        const possibleFields = [
                          '"table_chunk"',
                          '"converted_table"', 
                          '"table_html"',
                          '"shortened_chunk"', // Fallback if using same structure
                          '"generated_table"'
                        ];
                        
                        for (const field of possibleFields) {
                          if (accumulatedContent.includes(field)) {
                            const pattern = new RegExp(`${field}:\\s*"([^"]*(?:\\\\.[^"]*)*)`);
                            const match = accumulatedContent.match(pattern);
                            if (match && match[1]) {
                              // Unescape the JSON string and show clean table HTML
                              tableContent = match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
                              break;
                            }
                          }
                        }
                        
                        // If we found table content, show it; otherwise look for direct HTML
                        if (tableContent) {
                          setCompletion(tableContent);
                        } else if (accumulatedContent.includes('<table>')) {
                          // Fallback: extract direct table HTML if present
                          const directTableMatch = accumulatedContent.match(/<table>.*?<\/table>/s);
                          if (directTableMatch) {
                            setCompletion(directTableMatch[0]);
                          }
                        }
                        // Don't show the raw JSON chunk structure
                      } else if (option === 'list') {
                        // For list conversion, accumulate the content pieces
                        accumulatedContent += contentPiece;
                        
                        // Try different possible field names for list content
                        let listContent = '';
                        
                        // Check for various possible field names your backend might use for lists
                        const possibleListFields = [
                          '"list_chunk"',
                          '"converted_list"', 
                          '"list_html"',
                          '"shortened_chunk"', // Fallback if using same structure
                          '"generated_list"'
                        ];
                        
                        for (const field of possibleListFields) {
                          if (accumulatedContent.includes(field)) {
                            const pattern = new RegExp(`${field}:\\s*"([^"]*(?:\\\\.[^"]*)*)`);
                            const match = accumulatedContent.match(pattern);
                            if (match && match[1]) {
                              // Unescape the JSON string and show clean list HTML
                              listContent = match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
                              break;
                            }
                          }
                        }
                        
                        // If we found list content, show it; otherwise look for direct HTML
                        if (listContent) {
                          setCompletion(listContent);
                        } else if (accumulatedContent.includes('<ul>') || accumulatedContent.includes('<ol>')) {
                          // Fallback: extract direct list HTML if present
                          const directListMatch = accumulatedContent.match(/<(ul|ol)>.*?<\/(ul|ol)>/s);
                          if (directListMatch) {
                            setCompletion(directListMatch[0]);
                          }
                        }
                        // Don't show the raw JSON chunk structure
                      } else {
                        // For text shortening, build the content piece by piece
                        accumulatedContent += contentPiece;
                        
                        // Try to extract the shortened text from the JSON as it builds
                        if (accumulatedContent.includes('"shortened_chunk"')) {
                          const match = accumulatedContent.match(/"shortened_chunk":\s*"([^"]*)/);
                          if (match && match[1]) {
                            // Show the typing effect of the shortened text
                            setCompletion(match[1]);
                          }
                        }
                      }
                    }
                  } else if (parsed.event === 'complete') {
                    // Final content from complete event
                    if (option === 'table') {
                      // Try different possible field names for final table content
                      const finalTable = parsed.table_html || parsed.converted_table || parsed.table_chunk || parsed.generated_table || parsed.shortened_text;
                      if (finalTable) {
                        setCompletion(finalTable);
                      }
                    } else if (option === 'list') {
                      // Try different possible field names for final list content
                      const finalList = parsed.list_html || parsed.converted_list || parsed.list_chunk || parsed.generated_list || parsed.shortened_text;
                      if (finalList) {
                        setCompletion(finalList);
                      }
                    } else if (parsed.shortened_text) {
                      setCompletion(parsed.shortened_text);
                    }
                    break;
                  } else if (parsed.event === 'chunk_complete') {
                    // Handle chunk completion - show the final content
                    if (option === 'table') {
                      // Try different possible field names for table chunk completion
                      const tableChunk = parsed.table_html || parsed.converted_table || parsed.table_chunk || parsed.generated_table || parsed.shortened_chunk;
                      if (tableChunk) {
                        setCompletion(tableChunk);
                      }
                    } else if (option === 'list') {
                      // Try different possible field names for list chunk completion
                      const listChunk = parsed.list_html || parsed.converted_list || parsed.list_chunk || parsed.generated_list || parsed.shortened_chunk;
                      if (listChunk) {
                        setCompletion(listChunk);
                      }
                    } else if (parsed.shortened_chunk) {
                      setCompletion(parsed.shortened_chunk);
                    }
                  }
                } catch (e) {
                  // Skip invalid JSON chunks
                  console.warn('Failed to parse SSE data:', data);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          setIsStreaming(false);
        }
      }
      
      options.onResponse?.(response);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      toast.error(error.message);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    completion,
    complete,
    isLoading,
    isStreaming,
    error,
    hasCompletion: completion.length > 0,
    resetCompletion,
    forceReset
  };
}



