import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NodeViewWrapper } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import './EmbedView.css';
// Load Twitter widgets script once
let twitterScriptLoaded = false;
const loadTwitterScript = () => {
    return new Promise((resolve, reject) => {
        if (twitterScriptLoaded && window.twttr?.widgets) {
            resolve();
            return;
        }
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="platform.twitter.com/widgets.js"]');
        if (existingScript) {
            twitterScriptLoaded = true;
            // Wait a bit for script to be ready
            setTimeout(() => resolve(), 100);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.charset = 'utf-8';
        script.onload = () => {
            twitterScriptLoaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Twitter widgets script'));
        document.body.appendChild(script);
    });
};
// Extract tweet ID from X/Twitter URL
const getXTweetId = (url) => {
    if (!url)
        return null;
    const regExp = /(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[2] : null;
};
// Extract username from X/Twitter URL
const getXUsername = (url) => {
    if (!url)
        return null;
    const regExp = /(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
};
function TwitterView({ node, selected }) {
    const { tweetId: attrTweetId, username: attrUsername, width = 550, src } = node.attrs;
    // Support both direct attributes and extracting from src URL
    const tweetId = attrTweetId || getXTweetId(src);
    const username = attrUsername || getXUsername(src) || 'user';
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const containerRef = useRef(null);
    const tweetUrl = tweetId ? `https://twitter.com/${username}/status/${tweetId}` : '';
    useEffect(() => {
        if (!tweetId) {
            setHasError(true);
            setIsLoading(false);
            return;
        }
        let mounted = true;
        const initEmbed = async () => {
            try {
                await loadTwitterScript();
                if (!mounted)
                    return;
                // Process the embed using twttr.widgets.load() - same pattern as Instagram
                if (window.twttr?.widgets?.load) {
                    // Small delay to ensure DOM is ready
                    setTimeout(() => {
                        if (mounted && window.twttr?.widgets?.load) {
                            window.twttr.widgets.load(containerRef.current || undefined);
                            setIsLoading(false);
                        }
                    }, 100);
                }
                else {
                    setIsLoading(false);
                }
            }
            catch {
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
    }, [tweetId]);
    // Handle when embed fails or is blocked
    if (hasError || !tweetId) {
        return (_jsx(NodeViewWrapper, { className: "embed-node-wrapper", children: _jsxs("div", { className: `twitter-embed-container twitter-fallback ${selected ? 'ProseMirror-selectednode' : ''}`, style: {
                    position: 'relative',
                    width: '100%',
                    maxWidth: `${width}px`,
                    margin: '1.5rem auto',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#fff',
                    border: '1px solid #e1e8ed',
                    textAlign: 'center',
                }, children: [_jsx("div", { style: { marginBottom: '12px' }, children: _jsx("svg", { width: "48", height: "48", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", fill: "#000" }) }) }), _jsx("p", { style: { color: '#14171a', fontWeight: '500', marginBottom: '8px' }, children: "X/Twitter Post" }), _jsx("a", { href: tweetUrl, target: "_blank", rel: "noopener noreferrer", style: {
                            display: 'inline-block',
                            padding: '8px 16px',
                            backgroundColor: '#000',
                            color: 'white',
                            borderRadius: '20px',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                        }, children: "View on X" })] }) }));
    }
    return (_jsxs(NodeViewWrapper, { className: "embed-node-wrapper", children: [_jsxs("div", { ref: containerRef, className: `twitter-embed-container ${selected ? 'ProseMirror-selectednode' : ''}`, style: {
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: `${width}px`,
                    margin: '1.5rem auto',
                    minHeight: isLoading ? '300px' : 'auto',
                    position: 'relative',
                }, children: [isLoading && (_jsxs("div", { style: {
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                        }, children: [_jsx("div", { style: {
                                    width: '40px',
                                    height: '40px',
                                    border: '3px solid #f3f3f3',
                                    borderTop: '3px solid #1DA1F2',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 12px',
                                } }), _jsx("p", { style: { color: '#666', fontSize: '14px' }, children: "Loading tweet..." })] })), _jsx("blockquote", { className: "twitter-tweet", "data-theme": "light", "data-width": String(width), style: {
                            display: isLoading ? 'none' : 'block',
                        }, children: _jsx("a", { href: tweetUrl, target: "_blank", rel: "noopener noreferrer", children: "View this tweet on X" }) })] }), _jsx("style", { children: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      ` })] }));
}
export default TwitterView;
//# sourceMappingURL=TwitterView.js.map