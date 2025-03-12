
import React, { useEffect, useRef } from 'react';

interface TimeLapsePreviewProps {
  frames: { id: string; file: File; url: string }[];
  currentFrameIndex: number;
  setCurrentFrameIndex: (index: number) => void;
  isPlaying: boolean;
  frameDelay: number;
}

export const TimeLapsePreview: React.FC<TimeLapsePreviewProps> = ({
  frames,
  currentFrameIndex,
  setCurrentFrameIndex,
  isPlaying,
  frameDelay,
}) => {
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // Handle animation playback
  useEffect(() => {
    if (frames.length === 0) return;
    
    const animate = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastFrameTimeRef.current;

      if (deltaTime >= frameDelay) {
        // Fix: Calculate the new index first, then pass it to setCurrentFrameIndex
        const newIndex = (currentFrameIndex + 1) % frames.length;
        setCurrentFrameIndex(newIndex);
        lastFrameTimeRef.current = timestamp;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      lastFrameTimeRef.current = 0;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, frameDelay, frames.length, setCurrentFrameIndex, currentFrameIndex]);

  if (frames.length === 0) {
    return (
      <div className="flex items-center justify-center aspect-video bg-gray-900">
        <div className="text-center p-6">
          <p className="text-lg font-medium mb-2 text-white">Nenhuma imagem adicionada</p>
          <p className="text-sm text-gray-300">
            Adicione imagens para começar a criar seu time-lapse
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
      <img
        src={frames[currentFrameIndex]?.url}
        alt={`Preview frame ${currentFrameIndex + 1}`}
        className="max-h-full max-w-full object-contain"
      />
      
      {/* Frame counter overlay */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 px-3 py-1 rounded-full text-xs text-white">
        Frame {currentFrameIndex + 1} / {frames.length}
      </div>
    </div>
  );
};
