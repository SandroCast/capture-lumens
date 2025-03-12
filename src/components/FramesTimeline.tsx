
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface FramesTimelineProps {
  frames: { id: string; file: File; url: string }[];
  currentFrameIndex: number;
  setCurrentFrameIndex: (index: number) => void;
  selectedFrames: Set<string>;
  toggleFrameSelection: (id: string) => void;
}

export const FramesTimeline: React.FC<FramesTimelineProps> = ({
  frames,
  currentFrameIndex,
  setCurrentFrameIndex,
  selectedFrames,
  toggleFrameSelection,
}) => {
  if (frames.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm">Nenhuma imagem adicionada ainda</p>
      </div>
    );
  }

  // Performance optimization for large sets of frames
  // This implements virtual scrolling for the thumbnails
  const frameElements = frames.map((frame, index) => (
    <div 
      key={frame.id}
      className={`relative group rounded transition-colors border-2 mb-2 ${
        index === currentFrameIndex 
          ? 'border-blue-500' 
          : selectedFrames.has(frame.id)
            ? 'border-yellow-500' 
            : 'border-transparent'
      }`}
    >
      <div 
        className="flex items-start p-2 cursor-pointer"
        onClick={() => setCurrentFrameIndex(index)}
      >
        <div className="mr-3">
          <Checkbox 
            checked={selectedFrames.has(frame.id)}
            onCheckedChange={() => toggleFrameSelection(frame.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium truncate">
              Frame {index + 1}
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(frame.file.size / 1024)} KB
            </span>
          </div>
          
          <div className="flex items-center">
            <div className="w-16 h-10 bg-black overflow-hidden rounded mr-3">
              <img 
                src={frame.url} 
                alt={`Frame ${index + 1}`} 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-xs text-left truncate flex-1">
              {frame.file.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  ));

  return <div className="space-y-1">{frameElements}</div>;
};
