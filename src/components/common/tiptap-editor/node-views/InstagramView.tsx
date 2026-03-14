import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import './EmbedView.css';

// Declare global instgrm object for TypeScript
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

// Load Instagram embed script once
let instagramScriptLoaded = false;
const loadInstagramScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (instagramScriptLoaded && window.instgrm) {
      resolve();
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="instagram.com/embed.js"]');
    if (existingScript) {
      instagramScriptLoaded = true;
      // Wait a bit for script to be ready
      setTimeout(() => resolve(), 100);
      return;
    }

    const script = document.createElement('script');
    script.src = '//www.instagram.com/embed.js';
    script.async = true;
    script.onload = () => {
      instagramScriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Instagram embed script'));
    document.body.appendChild(script);
  });
};

// Extract post ID from Instagram URL
const getInstagramPostId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\/([^/?#&]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

function InstagramView({ node, selected }: NodeViewProps) {
  const { src, postId: attrPostId, width = 400 } = node.attrs;
  // Support both 'src' (new) and 'postId' (old) attributes
  const postId = attrPostId || getInstagramPostId(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const blockquoteRef = useRef<HTMLQuoteElement>(null);
  
  const postUrl = postId ? `https://www.instagram.com/p/${postId}/` : '';

  useEffect(() => {
    if (!postId) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const initEmbed = async () => {
      try {
        await loadInstagramScript();
        
        if (!mounted) return;
        
        // Process the embed
        if (window.instgrm?.Embeds?.process) {
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            if (mounted && window.instgrm?.Embeds?.process) {
              window.instgrm.Embeds.process();
              setIsLoading(false);
            }
          }, 100);
        } else {
          setIsLoading(false);
        }
      } catch {
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    initEmbed();

    return () => {
      mounted = false;
    };
  }, [postId]);

  // Handle when embed fails or is blocked
  if (hasError || !postId) {
    return (
      <NodeViewWrapper className="embed-node-wrapper">
        <div
          className={`instagram-embed-container instagram-fallback ${selected ? 'ProseMirror-selectednode' : ''}`}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: `${width}px`,
            margin: '1.5rem auto',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fafafa',
            border: '1px solid #dbdbdb',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FEDA75" />
                <stop offset="25%" stopColor="#FA7E1E" />
                <stop offset="50%" stopColor="#D62976" />
                <stop offset="75%" stopColor="#962FBF" />
                <stop offset="100%" stopColor="#4F5BD5" />
              </linearGradient>
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#instagram-gradient)" strokeWidth="2" fill="none"/>
              <circle cx="12" cy="12" r="4" stroke="url(#instagram-gradient)" strokeWidth="2" fill="none"/>
              <circle cx="18" cy="6" r="1.5" fill="url(#instagram-gradient)"/>
            </svg>
          </div>
          <p style={{ color: '#262626', fontWeight: '500', marginBottom: '8px' }}>Instagram Post</p>
          <a 
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#0095f6',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            View on Instagram
          </a>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="embed-node-wrapper">
      <div
        ref={containerRef}
        className={`instagram-embed-container ${selected ? 'ProseMirror-selectednode' : ''}`}
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          maxWidth: `${width}px`,
          margin: '1.5rem auto',
          minHeight: isLoading ? '400px' : 'auto',
          position: 'relative',
        }}
      >
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #E1306C',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px',
              }}
            />
            <p style={{ color: '#666', fontSize: '14px' }}>Loading Instagram post...</p>
          </div>
        )}
        
        {/* Official Instagram blockquote embed */}
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={`${postUrl}?utm_source=ig_embed`}
          data-instgrm-version="14"
          style={{
            background: '#FFF',
            border: 0,
            borderRadius: '3px',
            boxShadow: '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
            margin: 0,
            maxWidth: `${width}px`,
            minWidth: '326px',
            padding: 0,
            width: 'calc(100% - 2px)',
            display: isLoading ? 'none' : 'block',
          }}
        >
          <div style={{ padding: '16px' }}>
            <a
              href={postUrl}
              style={{
                background: '#FFFFFF',
                lineHeight: 0,
                padding: 0,
                textAlign: 'center',
                textDecoration: 'none',
                width: '100%',
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              View this post on Instagram
            </a>
          </div>
        </blockquote>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </NodeViewWrapper>
  );
}

export default InstagramView;
