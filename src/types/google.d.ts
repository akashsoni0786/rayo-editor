/**
 * TypeScript definitions for Google Identity Services (One Tap)
 */

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface GooglePromptNotification {
  isDisplayed(): boolean;
  isNotDisplayed(): boolean;
  isSkippedMoment(): boolean;
  getNotDisplayedReason(): string;
  getSkippedReason(): string;
  getMomentType(): string;
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string | number;
  locale?: string;
}

interface GoogleInitConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  ux_mode?: 'popup' | 'redirect';
  login_uri?: string;
  native_callback?: (response: GoogleCredentialResponse) => void;
  intermediate_iframe_close_callback?: () => void;
  itp_support?: boolean;
}

interface GoogleAccounts {
  id: {
    initialize: (config: GoogleInitConfig) => void;
    prompt: (callback?: (notification: GooglePromptNotification) => void) => void;
    renderButton: (element: HTMLElement | null, config: GoogleButtonConfig) => void;
    disableAutoSelect: () => void;
    storeCredential: (credential: { id: string; password: string }) => void;
    cancel: () => void;
    onGoogleLibraryLoad: () => void;
    revoke: (hint: string, callback: (response: { successful: boolean; error?: string }) => void) => void;
  };
}

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

export {};
