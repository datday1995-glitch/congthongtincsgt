import { useState } from 'react';
import { FileText } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  lazy?: boolean;
}

export function SafeImage({
  src,
  alt,
  className = '',
  fallbackTitle,
  lazy = true,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0B1F3A] via-[#12325C] to-[#1D4ED8] text-white/90 p-6 text-center ${className}`}
      >
        <FileText className="h-9 w-9 text-blue-200 mb-2 shrink-0" />
        {fallbackTitle && (
          <span className="text-xs font-medium text-blue-100 line-clamp-2 max-w-[220px]">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={lazy ? 'lazy' : 'eager'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
