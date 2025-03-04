
import React, { useEffect, useRef, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import LightDetector from './LightDetector';
import { captureImage } from '../utils/imageProcessing';
import { downloadBlob } from '../utils/zipUtils';

interface CameraProps {
  selectedCameraId: string;
  sensitivity: number;
  useFlashlight: boolean;
  onImageCaptured: (image: Blob) => void;
}

const Camera: React.FC<CameraProps> = ({
  selectedCameraId,
  sensitivity,
  useFlashlight,
  onImageCaptured
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isActive, setIsActive] = useState(true);
  const [isProcessingLight, setIsProcessingLight] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  
  // Start camera stream
  useEffect(() => {
    const startCamera = async () => {
      try {
        // Stop any existing stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
            facingMode: selectedCameraId ? undefined : 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
        
        streamRef.current = stream;
        
        // Set stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        setIsActive(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast({
          title: 'Camera Error',
          description: 'Could not access the camera. Please check permissions.',
          variant: 'destructive'
        });
      }
    };
    
    startCamera();
    
    // Prevent screen from sleeping
    const wakeLock = async () => {
      try {
        // @ts-ignore - WakeLock API might not be typed
        if ('wakeLock' in navigator) {
          // @ts-ignore
          await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error('Wake Lock error:', err);
      }
    };
    
    wakeLock();
    
    return () => {
      // Clean up stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedCameraId]);
  
  // Toggle flashlight
  const toggleFlashlight = async (on: boolean) => {
    if (!streamRef.current) return;
    
    try {
      const track = streamRef.current.getVideoTracks()[0];
      if (!track) return;
      
      // Check if flashlight is supported
      const capabilities = track.getCapabilities();
      // @ts-ignore - torch might not be in types
      if (!capabilities.torch) {
        if (on) {
          toast({
            title: 'Flashlight Unavailable',
            description: 'Your device does not support flashlight control.',
            variant: 'default'
          });
        }
        return;
      }
      
      // Set flashlight state
      // @ts-ignore - torch might not be in types
      await track.applyConstraints({ advanced: [{ torch: on }] });
      setFlashlightOn(on);
    } catch (error) {
      console.error('Flashlight error:', error);
      if (on) {
        toast({
          title: 'Flashlight Error',
          description: 'Could not control the flashlight.',
          variant: 'destructive'
        });
      }
    }
  };
   
  // Handle light detection and capture sequence
  const handleLightDetected = async () => {
    if (isProcessingLight) return;
    
    setIsProcessingLight(true);
    setIsActive(false);
    
    try {
      // Turn on flashlight if enabled
      if (useFlashlight) {
        await toggleFlashlight(true);
        
        // Allow time for exposure adjustment
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Capture image
      if (videoRef.current) {
        const image = await captureImage(videoRef.current);
        onImageCaptured(image);
        
        // Download the captured image immediately
        const captureNumber = captureCount + 1;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        downloadBlob(image, `capture-${captureNumber}-${timestamp}.jpg`);
        setCaptureCount(captureNumber);
        
        toast({
          title: 'Image Captured',
          description: 'LED light detected, image saved and downloaded.',
        });
      }
      
      // Turn off flashlight
      if (useFlashlight) {
        await toggleFlashlight(false);
      }
      
      // Cooldown period
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.error('Capture error:', error);
      toast({
        title: 'Capture Error',
        description: 'Failed to capture image.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessingLight(false);
      setIsActive(true);
    }
  };
  
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      <LightDetector
        videoRef={videoRef}
        sensitivity={sensitivity}
        isActive={isActive && !isProcessingLight}
        onLightDetected={handleLightDetected}
      />
      
      {/* Status indicators */}
      {flashlightOn && (
        <div className="absolute top-4 right-4 bg-yellow-400 rounded-full w-4 h-4 animate-pulse-light" />
      )}
      
      {isProcessingLight && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-20">
          <div className="text-white text-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm font-medium">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Camera;
