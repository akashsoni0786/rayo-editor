import { toast as hotToast } from 'react-hot-toast';

export interface KeywordToastOptions {
  title?: string;
  description: string;
  variant?: 'default' | 'destructive';
}

export interface KeywordToastAPI {
  toast: (options: KeywordToastOptions) => void;
}

export function useKeywordToast(): KeywordToastAPI {
  const toast = ({ title, description, variant = 'default' }: KeywordToastOptions) => {
    const isDestructive = variant === 'destructive';

    console.log('Showing keyword toast:', { title, description, variant });

    hotToast((t) => (
      <div className="w-[343px] px-4 py-3 bg-[#212925] rounded-2xl flex items-center gap-4 isolate overflow-hidden relative">
        {/* Icon section */}
        <div className="w-8 h-8 min-w-[32px] min-h-[32px] bg-white/10 rounded-full p-1 flex items-center justify-center shrink-0">
          {isDestructive ? (
            <svg width="24" height="24" viewBox="4 4 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 6C10.47 6 6 10.47 6 16s4.47 10 10 10 10-4.47 10-10S21.53 6 16 6zm5 13.59L19.59 21 16 17.41 12.41 21 11 19.59 14.59 16 11 12.41 12.41 11 16 14.59 19.59 11 21 12.41 17.41 16 21 19.59z" fill="#FF4444"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="4 4 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.6 20.6L21.65 13.55L20.25 12.15L14.6 17.8L11.75 14.95L10.35 16.35L14.6 20.6ZM16 26C14.6167 26 13.3167 25.7373 12.1 25.212C10.8833 24.6873 9.825 23.975 8.925 23.075C8.025 22.175 7.31267 21.1167 6.788 19.9C6.26267 18.6833 6 17.3833 6 16C6 14.6167 6.26267 13.3167 6.788 12.1C7.31267 10.8833 8.025 9.825 8.925 8.925C9.825 8.025 10.8833 7.31233 12.1 6.787C13.3167 6.26233 14.6167 6 16 6C17.3833 6 18.6833 6.26233 19.9 6.787C21.1167 7.31233 22.175 8.025 23.075 8.925C23.975 9.825 24.6873 10.8833 25.212 12.1C25.7373 13.3167 26 14.6167 26 16C26 17.3833 25.7373 18.6833 25.212 19.9C24.6873 21.1167 23.975 22.175 23.075 23.075C22.175 23.975 21.1167 24.6873 19.9 25.212C18.6833 25.7373 17.3833 26 16 26Z" fill="#00DF80"/>
            </svg>
          )}
        </div>

        {/* Content section */}
        <div className="flex-1 flex flex-col items-start">
          <div className="self-stretch text-white text-sm font-medium font-['Inter'] leading-[140%] tracking-[-0.02em]">
            {description}
          </div>
          {title && (
            <div className="self-stretch text-[#C8C5C5] text-sm font-medium font-['Inter'] leading-[150%] tracking-[-0.02em]">
              {title}
            </div>
          )}
        </div>

        {/* Gradient effect */}
        <div
          style={{
            position: 'absolute',
            width: '212px',
            height: '212px',
            right: '-100px',
            top: '-65px',
            borderRadius: '9999px',
            pointerEvents: 'none',
            zIndex: 3,
            background: isDestructive
              ? 'radial-gradient(50% 50% at 50% 50%, rgba(240, 66, 72, 0.12) 0%, rgba(240, 66, 72, 0) 100%)'
              : 'radial-gradient(50% 50% at 50% 50%, rgba(0, 237, 81, 0.12) 0%, rgba(0, 237, 123, 0) 100%)',
          }}
        />
      </div>
    ), {
      duration: 4000,
      position: 'bottom-right',
      style: {
        background: 'transparent',
        border: 'none',
        padding: '0',
        boxShadow: 'none',
      },
    });
  };

  return { toast };
}
