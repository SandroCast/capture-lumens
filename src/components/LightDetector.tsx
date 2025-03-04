
import React, { useRef, useEffect, useState } from 'react';
import { detectLight } from '../utils/imageProcessing';

interface LightDetectorProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  sensitivity: number;
  isActive: boolean;
  onLightDetected: () => void;
  targetColor?: { r: number, g: number, b: number } | null;
}

const LightDetector: React.FC<LightDetectorProps> = ({
  videoRef,
  sensitivity,
  isActive,
  onLightDetected,
  targetColor
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dots, setDots] = useState<{ x: number; y: number }[]>([]);
  const [brightestPoint, setBrightestPoint] = useState<{ x: number; y: number } | null>(null);
  
  // Detection loop
  useEffect(() => {
    if (!isActive || !videoRef.current || !canvasRef.current) return;
    
    let animationFrameId: number;
    let lastDetectionTime = 0;
    const detectionInterval = 100; // Check every 100ms for better performance
    
    const detectLoop = (timestamp: number) => {
      if (timestamp - lastDetectionTime > detectionInterval) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (video && canvas && video.readyState === 4) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Update canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw current video frame to canvas for analysis
            ctx.drawImage(video, 0, 0);
            
            // Detect light in the image
            const result = detectLight(canvas, sensitivity, targetColor || undefined);
            
            if (result.detected) {
              setBrightestPoint(result.brightestPoint);
              onLightDetected();
            } else {
              setBrightestPoint(null);
            }
            
            // Update the visual dots (simplified for this example)
            if (result.brightestPoint) {
              setDots(prev => {
                const newDots = [...prev, result.brightestPoint];
                // Keep only recent dots for performance
                return newDots.slice(-10);
              });
            }
          }
        }
        
        lastDetectionTime = timestamp;
      }
      
      animationFrameId = requestAnimationFrame(detectLoop);
    };
    
    animationFrameId = requestAnimationFrame(detectLoop);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, videoRef, sensitivity, onLightDetected, targetColor]);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Hidden canvas for image processing */}
      <canvas 
        ref={canvasRef} 
        className="hidden"
      />
      
      {/* Visual indicators for detected light points */}
      {dots.map((dot, index) => (
        <div
          key={index}
          className="light-dot"
          style={{
            left: `${(dot.x / (canvasRef.current?.width || 1)) * 100}%`,
            top: `${(dot.y / (canvasRef.current?.height || 1)) * 100}%`,
            width: `${8 + (index * 2)}px`,
            height: `${8 + (index * 2)}px`,
            opacity: (index / 10) + 0.3
          }}
        />
      ))}
      
      {/* Highlight for brightest point */}
      {brightestPoint && (
        <div
          className="absolute rounded-full shadow-lg animate-pulse-light z-10"
          style={{
            left: `${(brightestPoint.x / (canvasRef.current?.width || 1)) * 100}%`,
            top: `${(brightestPoint.y / (canvasRef.current?.height || 1)) * 100}%`,
            width: '20px',
            height: '20px',
            transform: 'translate(-50%, -50%)',
            backgroundColor: targetColor ? `rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})` : 'rgb(59, 130, 246)'
          }}
        />
      )}
    </div>
  );
};

export default LightDetector;
