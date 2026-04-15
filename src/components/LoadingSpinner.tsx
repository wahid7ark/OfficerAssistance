import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
};

export function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeMap[size]} text-[#00eaff] animate-spin`} />
      {text && <span className="text-[#7feaff] text-sm">{text}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000814]/90 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ isLoading, text = 'Loading...', children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#000814]/80 backdrop-blur-sm rounded-xl">
          <LoadingSpinner size="md" text={text} />
        </div>
      )}
    </div>
  );
}
