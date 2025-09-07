// src/renderer/components/ui/BannerImage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AssetLoader } from '@/lib/AssetLoader';

interface BannerImageProps {
  bannerPath: string;
  title: string;
}

const BannerImage: React.FC<BannerImageProps> = ({ bannerPath, title }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Remove /assets/ prefix if present
        const assetPath = bannerPath.replace('/assets/', '');
        const blobUrl = await AssetLoader.loadImage(assetPath);
        setImageSrc(blobUrl);
      } catch (err) {
        console.error(`Failed to load banner image: ${bannerPath}`, err);
        setError('Failed to load image');
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();

    // Cleanup blob URL on unmount
    return () => {
      if (imageSrc) {
        AssetLoader.cleanup(imageSrc);
      }
    };
  }, [bannerPath]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        <div className="text-white/70">No Image</div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={title}
      className="w-full h-full object-cover"
    />
  );
};

export default BannerImage;
