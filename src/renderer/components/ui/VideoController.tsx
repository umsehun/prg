// src/renderer/components/ui/VideoController.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

interface VideoControllerProps {
  videoPath: string | null;
  className?: string;
}

const VideoController: React.FC<VideoControllerProps> = ({ videoPath, className = "" }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Cleanup previous object URL if it exists
    if (videoUrl && videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl);
    }

    if (!videoPath) {
      setVideoUrl(null);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    setIsReady(false);

    // Always use IPC to load video assets
    (window as any).electron.loadAsset(videoPath)
      .then((data: any) => {
        if (data) {
          const blob = new Blob([data], { type: 'video/mp4' });
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          setIsLoading(false);
        } else {
          throw new Error('IPC returned no data for video asset');
        }
      })
      .catch((err: any) => {
        console.error('Failed to load video asset via IPC:', err);
        setHasError(true);
        setIsLoading(false);
      });

    // Cleanup function for when the component unmounts or videoPath changes
    return () => {
      if (videoUrl && videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoPath]);

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setIsReady(true);
    setHasError(false);
  };

  const handleError = () => {
    console.error(`Failed to load video: ${videoUrl}`);
    setIsLoading(false);
    setHasError(true);
  };

  if (!videoUrl) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center" style={{ zIndex: -1 }}>
        {isLoading && <div className="text-white">Loading Video...</div>}
        {hasError && <div className="text-red-500">Error Loading Video</div>}
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className={`fixed inset-0 w-full h-full object-cover ${className}`}
      src={videoUrl}
      autoPlay
      loop
      muted
      playsInline
      onLoadStart={handleLoadStart}
      onCanPlay={handleCanPlay}
      onError={handleError}
      style={{
        opacity: isReady ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        zIndex: -1  // Changed from 1 to -1 to ensure it stays behind game elements
      }}
    />
  );
};

export default VideoController;
