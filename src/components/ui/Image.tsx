import React, { useState } from 'react';
import NextImage from 'next/image';
import { ImageIcon } from 'lucide-react';

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  showFallback?: boolean;
  priority?: boolean;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackSrc,
  showFallback = true,
  priority = false,
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  if (error && !fallbackSrc && showFallback) {
    return (
      <div
        className={`ui-image-fallback bg-secondary-100 flex items-center justify-center ${className}`}
        style={width && height ? { width, height } : {}}
      >
        <ImageIcon className="ui-image-fallback-icon w-8 h-8 text-secondary-400" />
      </div>
    );
  }

  return (
    <div className={`ui-image-container relative ${className}`}>
      {loading && (
        <div
          className="ui-image-loading absolute inset-0 bg-secondary-100 animate-pulse"
          style={width && height ? { width, height } : {}}
        />
      )}
      <NextImage
        src={error && fallbackSrc ? fallbackSrc : src}
        alt={alt}
        width={width}
        height={height}
        className={`ui-image-element ${className}`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
      />
    </div>
  );
};