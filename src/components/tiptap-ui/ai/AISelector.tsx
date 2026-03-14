import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { DOMSerializer } from '@tiptap/pm/model';
import { Table, ArrowDownWideNarrow, List, ArrowLeftRight, ListEnd, Trash2, RefreshCw, X, Lock } from 'lucide-react';
import { TbLock } from "react-icons/tb";
import { useAICompletion } from './useAICompletion';
import { IoStopCircleOutline } from "react-icons/io5";
import { MagicIcon } from '../../tiptap-icons/magic-icon';
import { Button } from '../../ui/button';
import { motion, useAnimation } from 'framer-motion';
// usePlanRestrictions removed - stub values used instead

interface AISelectorProps {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const aiOptions = [
  {
    value: "table",
    label: "Convert to table",
    icon: Table,
  },
  {
    value: "shorter",
    label: "Make shorter",
    icon: ArrowDownWideNarrow,
  },
  {
    value: "list",
    label: "Convert to list",
    icon: List,
  },
];

export const AISelector: React.FC<AISelectorProps> = ({ editor, onOpenChange }) => {
  const { completion, complete, isLoading, isStreaming, hasCompletion, resetCompletion, forceReset } = useAICompletion();
  const [showOptions, setShowOptions] = React.useState(true);
  const [lastRequestData, setLastRequestData] = React.useState<{
    option: string, 
    projectId: string, 
    html: string,
    beforeContext?: string,
    afterContext?: string
  } | null>(null);
  const [renderableContent, setRenderableContent] = React.useState('');
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = React.useState(false);
  const scrollControls = useAnimation();
  const lastContentLengthRef = React.useRef(0);
  // Get plan restrictions
  const isFree = false;
  const canRetryTitles = true;

  // Process streaming completion to ensure valid HTML rendering while preserving live streaming
  React.useEffect(() => {
    if (completion) {
      try {
        // Light cleaning: Only remove the most problematic incomplete tags
        let cleanedContent = completion;
        
        // Only clean up obvious problematic patterns that cause flickering
        // Remove standalone "</" at the end
        if (cleanedContent.endsWith('</')) {
          cleanedContent = cleanedContent.slice(0, -2);
        }
        
        // Remove incomplete opening tags at the very end (but preserve content being typed)
        cleanedContent = cleanedContent.replace(/<[^>]*$/, '');
        
        // For live streaming, show content immediately
        setRenderableContent(cleanedContent);
        
        // Simple but effective auto-scroll for live streaming
        if (isStreaming) {
        
          
          // Always try to scroll during streaming (removed length check)
          lastContentLengthRef.current = cleanedContent.length;
          
          // Simple and reliable scroll approach
          setTimeout(() => {
            const scrollContainer = scrollContainerRef.current;
            if (scrollContainer) {
             
              
              if (!isUserScrolledUp) {
                // Force scroll to bottom immediately
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
              } else {
              }
            } else {
            }
          }, 10); // Very short delay
        }
        
      } catch (error) {
        console.warn('HTML parsing error:', error);
        // Minimal fallback: just remove problematic "</" 
        const safeContent = completion.replace(/<\/\s*$/, '');
        setRenderableContent(safeContent);
      }
    } else {
      setRenderableContent('');
    }
  }, [completion, isStreaming, isUserScrolledUp]);

  // Additional effect to ensure scrolling works with renderableContent changes
  React.useEffect(() => {
    if (isStreaming && renderableContent) {
      
      // Multiple scroll attempts with different timing
      const scrollToBottom = () => {
        // Method 1: Using ref
        const container = scrollContainerRef.current;
        if (container && !isUserScrolledUp) {
          container.scrollTop = container.scrollHeight;
          return;
        }
        
        // Method 2: Backup using ID selector
        const containerById = document.getElementById('ai-scroll-container');
        if (containerById && !isUserScrolledUp) {
          containerById.scrollTop = containerById.scrollHeight;
          return;
        }
        
      };

      scrollToBottom(); // Immediate
      setTimeout(scrollToBottom, 0); // Next tick
      setTimeout(scrollToBottom, 16); // Next frame
      setTimeout(scrollToBottom, 50); // Extra delay
    }
  }, [renderableContent, isStreaming, isUserScrolledUp]);



  // Enhanced scroll detection for live streaming
  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      // Clear existing timeout
      if (scrollTimeout) clearTimeout(scrollTimeout);
      
      // Debounce scroll detection
      scrollTimeout = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const scrollBottom = scrollTop + clientHeight;
        const isNearBottom = scrollHeight - scrollBottom < 50; // 50px threshold
        
        // Only mark as "scrolled up" if user is significantly away from bottom
        setIsUserScrolledUp(!isNearBottom);
      }, 100);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  // Reset scroll state and force scroll to bottom when streaming starts
  React.useEffect(() => {
    if (isStreaming) {
      setIsUserScrolledUp(false);
      lastContentLengthRef.current = 0;
      
      // Immediately scroll to bottom when streaming starts with multiple methods
      const forceScrollToBottom = () => {
        const container = scrollContainerRef.current || document.getElementById('ai-scroll-container');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      };
      
      forceScrollToBottom(); // Immediate
      setTimeout(forceScrollToBottom, 10);
      setTimeout(forceScrollToBottom, 50);
      setTimeout(forceScrollToBottom, 100);
    }
  }, [isStreaming]);

  // Reset completion when component mounts or receives new props
  React.useEffect(() => {
    // Only reset if we're not currently processing
    if (!isLoading && !isStreaming) {
      resetCompletion();
      setShowOptions(true);
    }
  }, []); // Only run on mount

  // Listen for global AI reset events (when user clicks elsewhere)
  React.useEffect(() => {
    const handleAIReset = () => {
      forceReset();
      setShowOptions(true);
    };

    // Listen for custom event dispatched when selection becomes empty
    window.addEventListener('ai-reset', handleAIReset);
    
    return () => {
      window.removeEventListener('ai-reset', handleAIReset);
    };
  }, [forceReset]);

  // Enhanced method to extract HTML from selection with before/after context
  const getSelectionWithContext = (editor: Editor): { 
    html: string; 
    text: string; 
    isEmpty: boolean;
    beforeContext: string;
    afterContext: string;
    fullContext: string;
  } => {
    const { state } = editor;
    const { selection } = state;
    const { from, to, empty } = selection;
    
    if (empty) {
      return { html: '', text: '', isEmpty: true, beforeContext: '', afterContext: '', fullContext: '' };
    }
    
    // Helper function to count words
    const countWords = (text: string): number => {
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };
    
    // Helper function to get first N words
    const getFirstNWords = (text: string, maxWords: number): string => {
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      return words.slice(0, maxWords).join(' ');
    };
    
    // Helper function to get last N words
    const getLastNWords = (text: string, maxWords: number): string => {
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      return words.slice(-maxWords).join(' ');
    };
    
    // Get the main selected content
    const selectedText = state.doc.textBetween(from, to, ' ');
    
    // Get before context (50 words max before selection)
    const beforeText = from > 0 ? state.doc.textBetween(0, from, ' ') : '';
    const beforeContext = countWords(beforeText) > 50 
      ? getLastNWords(beforeText, 50) 
      : beforeText;
    
    // Get after context (50 words max after selection)
    const docSize = state.doc.content.size;
    const afterText = to < docSize ? state.doc.textBetween(to, docSize, ' ') : '';
    const afterContext = countWords(afterText) > 50 
      ? getFirstNWords(afterText, 50) 
      : afterText;
    
    // Create full context for logging
    const fullContext = `${beforeContext} [SELECTED: ${selectedText}] ${afterContext}`.trim();
    
 
    
    try {
      // Extract HTML from selection (same as before)
      const slice = selection.content();
      const fragment = DOMSerializer.fromSchema(state.schema)
        .serializeFragment(slice.content);
      
      const div = document.createElement('div');
      div.appendChild(fragment);
      const html = div.innerHTML;
      
      return {
        html,
        text: selectedText,
        isEmpty: false,
        beforeContext,
        afterContext,
        fullContext
      };
    } catch (error) {
      console.warn('Primary HTML extraction failed, trying fallback:', error);
      
      // Fallback: try alternative slice method
      try {
        const slice = state.doc.slice(from, to);
        const fragment = DOMSerializer.fromSchema(state.schema)
          .serializeFragment(slice.content);
        
        const div = document.createElement('div');
        div.appendChild(fragment);
        const html = div.innerHTML;
        
        return {
          html,
          text: selectedText,
          isEmpty: false,
          beforeContext,
          afterContext,
          fullContext
        };
      } catch (fallbackError) {
        console.warn('Fallback HTML extraction failed, using plain text:', fallbackError);
        return {
          html: selectedText,
          text: selectedText,
          isEmpty: false,
          beforeContext,
          afterContext,
          fullContext
        };
      }
    }
  };

  const handleOptionSelect = async (option: string) => {
    // Check plan restrictions for free users
    if (isFree && !canRetryTitles) {
      return;
    }

    setShowOptions(false);
    
    // Extract HTML from selection with context using enhanced method
    const selectionData = getSelectionWithContext(editor);
    
    
    // Extract project ID from URL
    const projectId = window.location.pathname.split('/')[2];
    
    // Store request data for potential retry (including context)
    setLastRequestData({
      option,
      projectId,
      html: selectionData.html,
      beforeContext: selectionData.beforeContext,
      afterContext: selectionData.afterContext
    });
    
    // Send HTML format with context for better AI processing
    await complete(selectionData.html, { 
      body: { 
        option, 
        projectId,
        beforeContext: selectionData.beforeContext,
        afterContext: selectionData.afterContext
      } 
    });
  };

  const handleRetry = async () => {
    if (!lastRequestData) return;
    
    
    // Reset current completion
    resetCompletion();
    setShowOptions(false);
    
    // Retry with same parameters including context
    await complete(lastRequestData.html, { 
      body: { 
        option: lastRequestData.option, 
        projectId: lastRequestData.projectId,
        beforeContext: lastRequestData.beforeContext,
        afterContext: lastRequestData.afterContext
      } 
    });
  };



  const handleReplace = () => {
    try {
      const { from, to } = editor.state.selection;
      
      // Method 1: Try TipTap's HTML parser with proper options
      editor.chain()
        .focus()
        .deleteRange({ from, to })
        .insertContent(renderableContent, {
          parseOptions: {
            preserveWhitespace: false,
            findChildren: true,
          },
          updateSelection: true,
        })
        .run();
      
    } catch (error) {
      console.error('Error inserting HTML content:', error);
      // Method 2: Try using setContent on a temporary transaction
      try {
        const { from, to } = editor.state.selection;
        const { tr } = editor.state;
        
        // Delete the selected range
        const newTr = tr.delete(from, to);
        
        // Create a temporary doc with the completion HTML
        const tempDoc = editor.schema.nodeFromJSON({
          type: 'doc',
          content: [{
            type: 'paragraph',
            content: [{
              type: 'text',
              text: ''
            }]
          }]
        });
        
        // Try parsing the HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${completion}</div>`, 'text/html');
        
        editor.chain()
          .focus()
          .deleteRange({ from, to })
          .insertContentAt(from, renderableContent)
          .run();
          
      } catch (fallbackError) {
        console.error('Fallback insertion also failed:', fallbackError);
        // Method 3: Manual parsing for lists
        try {
          const { from, to } = editor.state.selection;
          
          // Check if content contains lists
          if (renderableContent.includes('<ul>') || renderableContent.includes('<ol>')) {
            // Parse list manually and insert using TipTap commands
            const isOrderedList = renderableContent.includes('<ol>');
            const listItems = renderableContent.match(/<li>(.*?)<\/li>/g);
            
            if (listItems && listItems.length > 0) {
              editor.chain()
                .focus()
                .deleteRange({ from, to })
                .run();
              
              // Insert list using TipTap's list commands
              if (isOrderedList) {
                editor.chain().toggleOrderedList().run();
              } else {
                editor.chain().toggleBulletList().run();
              }
              
              // Insert list items
              listItems.forEach((item, index) => {
                const text = item.replace(/<\/?li>/g, '');
                if (index === 0) {
                  editor.commands.insertContent(text);
                } else {
                  editor.chain().splitListItem('listItem').run();
                  editor.commands.insertContent(text);
                }
              });
            }
          } else {
            // For non-lists, just insert as text
            editor.chain().focus().deleteRange({ from, to }).insertContent(renderableContent).run();
          }
        } catch (finalError) {
          console.error('Final fallback failed:', finalError);
          // Absolute last resort: plain text
          const { from, to } = editor.state.selection;
          const plainText = renderableContent.replace(/<[^>]*>/g, '');
          editor.chain().focus().deleteRange({ from, to }).insertContent(plainText).run();
        }
      }
    }
    
    // Reset and clear selection after successful insertion
    resetCompletion();
    setTimeout(() => {
      editor.commands.setTextSelection(editor.state.selection.to);
    }, 100);
  };

  const handleInsertBelow = () => {
    try {
      const { to } = editor.state.selection;
      
      // Move to end of selection and insert a new paragraph, then content
      editor.chain()
        .focus()
        .setTextSelection(to)
        .insertContent('<p></p>')
        .insertContent(renderableContent, {
          parseOptions: {
            preserveWhitespace: false,
            findChildren: true,
          },
        })
        .run();
        
    } catch (error) {
      console.error('Error inserting HTML content below:', error);
      // Method 2: Manual list insertion for insert below
      try {
        const { to } = editor.state.selection;
        
        if (renderableContent.includes('<ul>') || renderableContent.includes('<ol>')) {
          // Parse list manually for insert below
          const isOrderedList = renderableContent.includes('<ol>');
          const listItems = renderableContent.match(/<li>(.*?)<\/li>/g);
          
          if (listItems && listItems.length > 0) {
            editor.chain()
              .focus()
              .setTextSelection(to)
              .insertContent('<p></p>')
              .run();
            
            // Insert list using TipTap's list commands
            if (isOrderedList) {
              editor.chain().toggleOrderedList().run();
            } else {
              editor.chain().toggleBulletList().run();
            }
            
            // Insert list items
            listItems.forEach((item, index) => {
              const text = item.replace(/<\/?li>/g, '');
              if (index === 0) {
                editor.commands.insertContent(text);
              } else {
                editor.chain().splitListItem('listItem').run();
                editor.commands.insertContent(text);
              }
            });
          }
        } else {
          // For non-lists, simple insertion
          editor.chain()
            .focus()
            .setTextSelection(to)
            .insertContent('<p></p>')
            .insertContent(renderableContent)
            .run();
        }
      } catch (fallbackError) {
        console.error('Fallback insertion below also failed:', fallbackError);
        // Last resort: insert as plain text
        const { to } = editor.state.selection;
        const plainText = renderableContent.replace(/<[^>]*>/g, '');
        editor.chain().focus().setTextSelection(to).insertContent(`\n\n${plainText}`).run();
      }
    }
    
    // Reset and clear selection after successful insertion
    resetCompletion();
    setTimeout(() => {
      editor.commands.setTextSelection(editor.state.selection.to);
    }, 100);
  };

  const handleDiscard = () => {
    resetCompletion();
    setShowOptions(true);
    // Force a re-render by updating a state or triggering editor update
    setTimeout(() => {
      editor.commands.focus();
    }, 50);
  };

  const handleClose = () => {
    
    // Force immediate reset of all states
    forceReset();
    setShowOptions(true);
    setLastRequestData(null);
    
    // Call onOpenChange to close the dialog
    onOpenChange(false);
    
    // Focus editor after a brief delay
    setTimeout(() => {
      editor.commands.focus();
    }, 100);
    
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };


  // Dynamic width based on state
  const getContainerWidth = () => {
    if (showOptions && !isLoading && !isStreaming && !hasCompletion) {
      return 'auto'; // Compact width for initial options
    }
    return '600px'; // Full width for AI processing and results
  };

  const isLockedFreeUser = isFree && !canRetryTitles;

  const handleUpgradeClick = () => {
    window.location.href = '/profile?tab=billing';
  };

  return (
    <div 
      className="transition-all duration-500 ease-in-out" 
      style={{
        zIndex: 10, 
        position: 'relative',
        width: getContainerWidth()
      }}
    >
      {/* Main Container with smooth height transitions */}
      <div className="gradient-border-container-slim w-full !rounded-[9px] transition-all duration-500 ease-in-out" style={{zIndex: 10, position: 'relative', boxShadow: '0px 4px 12px rgba(118, 99, 187, 0.1)'}}>
        <div className="gradient-border-container-slim-inner !rounded-[8px] overflow-hidden transition-all duration-500 ease-in-out" style={{background: 'linear-gradient(100deg, #FFF0E8 0%, #F5EAFF 100%)', zIndex: 10, position: 'relative'}}>
          {/* Close Button - Only show in final result phase */}
          {hasCompletion && !isLoading && !isStreaming && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
              }}
              className="absolute top-2 right-2 z-30"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Close AI Selector"
              type="button"
            >
              <X style={{width: '16px', height: '16px', color: '#000'}} />
            </button>
          )}

          {/* Command Options - Show by default or when open prop allows */}
          {showOptions && !isLoading && !isStreaming && !hasCompletion && (
            isLockedFreeUser ? (
              <div className="px-4 py-3 flex flex-col gap-3">
                <div className="inline-flex justify-center items-center gap-2 w-full">
                  {aiOptions.map((option) => (
                    <div key={option.value} className="px-2 py-1 bg-white/80 rounded-3xl flex justify-start items-center gap-2.5 border border-white/60">
                      <div className="text-center text-xs font-normal leading-4 text-black/60">
                        {option.value === 'shorter' ? 'Shorten' :
                          option.value === 'list' ? 'Create List' :
                          option.value === 'table' ? 'Create table' : option.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-px w-full bg-black/5" />
                <div className="flex flex-col gap-2 w-full">
                  <div className="text-[10px] font-medium leading-3 text-black/40">Unlock Pro</div>
                  <div className="flex items-center gap-8 flex-wrap">
                    <p className="text-[11px] font-semibold leading-4 text-black m-0">
                      Unlock all pro features <br /> including magic edit
                    </p>
                    <button
                      type="button"
                      onClick={handleUpgradeClick}
                      className="px-4 py-2.5 bg-[#694dff] rounded-[50px] text-white text-[10px] font-semibold leading-3 whitespace-nowrap"
                    >
                      Unlock pro tools
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Header for Options Phase */}
                <div className="flex p-3 w-full items-center px-4 text-sm font-medium text-black">
                  <img 
                    src="https://cdn.rayo.work/Rayo_assests/Subtract_ir7rhw.svg" 
                    alt="Rayo AI" 
                    className="h-4 w-4 shrink-0" 
                  />
                  <div className="w-px h-4 bg-gray-300 mx-2"></div>
                  <span className="tracking-[-0.02em]">Choose action</span>
                </div>
                
                <div className="pb-3 px-3 flex flex-col items-start gap-3">
                  <div className="w-full flex flex-col justify-center items-start gap-2.5">
                    <div className="flex justify-start items-center gap-2">
                      {aiOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => handleOptionSelect(option.value)}
                          className="px-3 py-2 bg-white rounded-[5px] flex justify-start items-center gap-2.5 transition-colors cursor-pointer hover:bg-gray-50"
                        >
                          <div className="text-center text-black text-xs font-normal leading-[18px] tracking-[-0.02em]">
                            {option.value === 'shorter' ? 'Shorten' : 
                             option.value === 'list' ? 'Create List' : 
                             option.value === 'table' ? 'Create table' : 
                             option.value === 'longer' ? 'Expand' : option.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Loading State with skeleton animation */}
          {isLoading && !isStreaming && (
            <div>
              <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-black border-b border-gray-100 tracking-[-0.02em]">
                <img 
                  src="https://cdn.rayo.work/Rayo_assests/Subtract_ir7rhw.svg" 
                  alt="Rayo AI" 
                  className="h-4 w-4 shrink-0 animate-pulse" 
                />
                <div className="h-4 w-px bg-gray-300 mx-2"></div>
                Rayo is thinking
              </div>
              
              {/* Skeleton Animation - thinking style */}
              <div className="px-4 pb-4 space-y-3">
                <div className="animate-pulse">
                  <div className="h-3 bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 rounded-full w-4/5"></div>
                </div>
                <div className="animate-pulse" style={{ animationDelay: '0.2s' }}>
                  <div className="h-3 bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 rounded-full w-3/5"></div>
                </div>
                <div className="animate-pulse" style={{ animationDelay: '0.4s' }}>
                  <div className="h-3 bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 rounded-full w-5/6"></div>
                </div>
                <div className="animate-pulse" style={{ animationDelay: '0.6s' }}>
                  <div className="h-3 bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 rounded-full w-2/3"></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Streaming State - just the writing indicator */}
          {isStreaming && (
            <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-black border-b border-gray-100 tracking-[-0.02em]">
              <img 
                src="https://cdn.rayo.work/Rayo_assests/Subtract_ir7rhw.svg" 
                alt="Rayo AI" 
                className="h-4 w-4 shrink-0 animate-spin" 
                style={{
                  animationDuration: '2s',
                  animationTimingFunction: 'linear'
                }}
              />
              <div className="h-4 w-px bg-gray-300 mx-2"></div>
              Rayo is writing
            </div>
          )}

          {/* Result Header - Show when completed */}
          {hasCompletion && !isStreaming && (
            <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-black border-b border-gray-100 tracking-[-0.02em]">
              <img 
                src="https://cdn.rayo.work/Rayo_assests/Subtract_ir7rhw.svg" 
                alt="Rayo AI" 
                className="h-4 w-4 shrink-0" 
              />
              <div className="h-4 w-px bg-gray-300 mx-2"></div>
              Here is the result
            </div>
          )}

          {/* Live Streaming Display */}
          {(isStreaming || hasCompletion) && (
            <div className="ai-streaming-container">
              <motion.div 
                ref={scrollContainerRef}
                id="ai-scroll-container"
                className="overflow-y-auto w-full max-h-[40vh]" 
                style={{
                  scrollBehavior: 'smooth',
                  transform: 'translateZ(0)', /* Force GPU acceleration */
                  backfaceVisibility: 'hidden', /* Reduce flicker */
                  willChange: 'scroll-position' /* Optimize scrolling */
                }}
                animate={scrollControls}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 120,
                  mass: 0.8
                }}
              >
                <div className="px-4">
                  <div 
                    className="text-sm text-black ai-content prose prose-sm max-w-none tracking-[-0.02em]"
                    style={{
                      color: '#000000'
                    } as React.CSSProperties}
                    dangerouslySetInnerHTML={{
                      __html: renderableContent
                    }}
                  />
                  <style jsx>{`
                    .ai-content {
                      color: #000000 !important;
                      transform: translateZ(0); /* Force GPU acceleration */
                      will-change: contents; /* Optimize for content changes */
                    }
                    
                    /* Disable typing animation for tables to prevent flickering */
                    .ai-content table,
                    .ai-content table *,
                    .ai-content tr,
                    .ai-content td,
                    .ai-content th,
                    .ai-content tbody,
                    .ai-content thead {
                      animation: none !important;
                      opacity: 1 !important;
                      transform: none !important;
                      transition: none !important;
                      animation-delay: 0s !important;
                      animation-duration: 0s !important;
                    }
                    
                    /* Also disable for table-related elements during streaming */
                    .ai-streaming-container table,
                    .ai-streaming-container table *,
                    .ai-streaming-container tr,
                    .ai-streaming-container td, 
                    .ai-streaming-container th,
                    .ai-streaming-container tbody,
                    .ai-streaming-container thead {
                      animation: none !important;
                      opacity: 1 !important;
                      transform: none !important;
                      transition: none !important;
                      animation-delay: 0s !important;
                      animation-duration: 0s !important;
                    }
                    
                    /* Optimized streaming container */
                    .ai-streaming-container {
                      contain: layout style paint; /* Contain all layout changes */
                      transform: translateZ(0); /* GPU acceleration */
                      backface-visibility: hidden; /* Reduce flicker */
                      will-change: contents; /* Optimize for content changes */
                    }
                    .ai-content *,
                    .ai-content p,
                    .ai-content ul,
                    .ai-content ol,
                    .ai-content li,
                    .ai-content table,
                    .ai-content tbody,
                    .ai-content thead,
                    .ai-content td,
                    .ai-content th,
                    .ai-content h1,
                    .ai-content h2,
                    .ai-content h3,
                    .ai-content h4,
                    .ai-content h5,
                    .ai-content h6,
                    .ai-content strong,
                    .ai-content em,
                    .ai-content span,
                    .ai-content div {
                      color: #000000 !important;
                    }
                    
                    /* Ensure lists display properly */
                    .ai-content ul {
                      list-style-type: disc !important;
                      margin-left: 1.5rem !important;
                      padding-left: 0.5rem !important;
                    }
                    .ai-content ol {
                      list-style-type: decimal !important;
                      margin-left: 1.5rem !important;
                      padding-left: 0.5rem !important;
                    }
                    .ai-content li {
                      display: list-item !important;
                      margin-bottom: 0.25rem !important;
                    }
                    
                    /* Optimized tables to prevent layout shifts */
                    .ai-content table {
                      width: 100% !important;
                      border-collapse: collapse !important;
                      margin: 1rem 0 !important;
                      table-layout: fixed !important; /* Prevent width recalculations */
                      contain: layout style !important; /* Contain layout changes */
                      transform: translateZ(0) !important; /* GPU acceleration */
                    }
                    .ai-content th,
                    .ai-content td {
                      border: 1px solid #d1d5db !important;
                      padding: 0.5rem !important;
                      text-align: left !important;
                      word-wrap: break-word !important; /* Prevent overflow */
                      overflow-wrap: break-word !important;
                    }
                    .ai-content th {
                      background-color: #f9fafb !important;
                      font-weight: 600 !important;
                    }
                    
                    /* Ensure paragraphs have proper spacing */
                    .ai-content p {
                      margin-bottom: 1rem !important;
                    }
                    
                    /* Ensure headings are styled */
                    .ai-content h1, .ai-content h2, .ai-content h3, 
                    .ai-content h4, .ai-content h5, .ai-content h6 {
                      font-weight: 600 !important;
                      margin-top: 1rem !important;
                      margin-bottom: 0.5rem !important;
                    }
                    .ai-content h1 { font-size: 1.5rem !important; }
                    .ai-content h2 { font-size: 1.3rem !important; }
                    .ai-content h3 { font-size: 1.1rem !important; }
                    
                    /* Ensure strong/bold text is visible */
                    .ai-content strong {
                      font-weight: 700 !important;
                    }
                    
                    /* Ensure italic text is visible */
                    .ai-content em {
                      font-style: italic !important;
                    }
                  `}</style>
                </div>
              </motion.div>
            </div>
          )}

          {/* Confirmation Options - Show after AI response */}
          {hasCompletion && !isLoading && !isStreaming && (
            <div className="pb-3 px-3">
              <div className="flex justify-end items-center gap-3">
                {/* Retry Button */}
                <div
                  onClick={handleRetry}
                  style={{
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    background: 'white',
                    boxShadow: '0px 0.5px 1px rgba(255, 255, 255, 0.50) inset',
                    overflow: 'hidden',
                    borderRadius: '39px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '4px',
                    display: 'inline-flex',
                    cursor: 'pointer',
                    height: 'auto',
                    minHeight: '24px'
                  }}
                >
                  <RefreshCw style={{width: '14px', height: '14px', flexShrink: 0}} />
                  <span style={{
                   textAlign: 'center',
                   color: '#0E0F11',
                   fontSize: '11px',
                   fontFamily: 'Inter',
                   fontWeight: '600',
                   fontStyle: 'semibold',
                   letterSpacing: '-0.02em',
                   lineHeight: '24px',
                   whiteSpace: 'nowrap'
                  }}>Retry</span>
                </div>
                <div
                  onClick={handleReplace}
                  style={{
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    background: 'white',
                    boxShadow: '0px 0.5px 1px rgba(255, 255, 255, 0.50) inset',
                    overflow: 'hidden',
                    borderRadius: '39px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '4px',
                    display: 'inline-flex',
                    cursor: 'pointer',
                    height: 'auto',
                    minHeight: '24px'
                  }}
                >
                  <ArrowLeftRight style={{width: '15px', height: '15px', flexShrink: 0}} />
                  <span style={{
                   textAlign: 'center',
                   color: '#0E0F11',
                   fontSize: '11px',
                   fontFamily: 'Inter',
                   fontWeight: '600',
                   fontStyle: 'semibold',
                   letterSpacing: '-0.02em',
                   lineHeight: '24px',
                   whiteSpace: 'nowrap'
                  }}>Replace</span>
                </div>
                
                <div
                  onClick={handleInsertBelow}
                  style={{
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    background: 'white',
                    boxShadow: '0px 0.5px 1px rgba(255, 255, 255, 0.50) inset',
                    overflow: 'hidden',
                    borderRadius: '39px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '4px',
                    display: 'inline-flex',
                    cursor: 'pointer',
                    height: 'auto',
                    minHeight: '24px'
                  }}
                >
                  <ListEnd style={{width: '15px', height: '15px', flexShrink: 0}} />
                  <span style={{
                    textAlign: 'center',
                    color: '#0E0F11',
                    fontSize: '11px',
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    fontStyle: 'semibold',
                    letterSpacing: '-0.02em',
                    lineHeight: '24px',
                    whiteSpace: 'nowrap'
                  }}>Insert below</span>
                </div>
              </div>
            </div>
          )}

          {/* Cancel button during streaming */}
          {(isLoading || isStreaming) && (
            <div className="p-3 flex justify-end">
              <div
                onClick={handleDiscard}
                style={{
                  paddingLeft: '10px',
                  paddingRight: '10px',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  background: 'white',
                  boxShadow: '0px 0.5px 1px rgba(255, 255, 255, 0.50) inset',
                  overflow: 'hidden',
                  borderRadius: '39px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px',
                  display: 'inline-flex',
                  cursor: 'pointer',
                  height: 'auto',
                  minHeight: '24px'
                }}
              >
                <IoStopCircleOutline style={{width: '14px', height: '14px', flexShrink: 0}} />
                <span style={{
                  textAlign: 'center',
                  color: '#0E0F11',
                  fontSize: '11px',
                  fontFamily: 'Inter',
                  fontWeight: '600',
                  fontStyle: 'semibold',
                  letterSpacing: '-0.02em',
                  lineHeight: '24px',
                  whiteSpace: 'nowrap'
                }}>Cancel</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
