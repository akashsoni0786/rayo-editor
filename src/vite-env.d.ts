/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_GPTZERO_API_KEY: string
  readonly VITE_API_URL: string
  // Add other VITE_ environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.riv' {
  const src: string;
  export default src;
} 