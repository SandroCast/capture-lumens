
import React, { useEffect, useRef, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import LightDetector from './LightDetector';
import { captureImage, DetectionRegion } from '../utils/imageProcessing';
import { downloadBlob } from '../utils/zipUtils';

interface CameraProps {
  selectedCameraId: string;
  sensitivity: number;
  useFlashlight: boolean;
  onImageCaptured: (image: Blob) => void;
  targetColor?: string;
  colorTolerance?: number;
  detectionRegion?: DetectionRegion;
  detectorEnabled: boolean;
  focusMode: 'auto' | 'manual';
  focusDistance?: number;
}

const Camera: React.FC<CameraProps> = ({
  selectedCameraId,
  sensitivity,
  useFlashlight,
  onImageCaptured,
  targetColor,
  colorTolerance,
  detectionRegion,
  detectorEnabled,
  focusMode,
  focusDistance = 0.5
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
        
        // Set up camera constraints
        const constraints: MediaTrackConstraints = {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        };
        
        // Add device ID if available
        if (selectedCameraId) {
          constraints.deviceId = { exact: selectedCameraId };
        } else {
          constraints.facingMode = 'environment';
        }
        
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: constraints,
          audio: false
        });
        
        streamRef.current = stream;
        
        // Set stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        setIsActive(true);
        
        // Apply focus settings after getting the stream
        if (focusMode === 'manual' && streamRef.current) {
          applyFocusSettings();
        }
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
  
  // Apply manual focus when it changes
  useEffect(() => {
    if (focusMode === 'manual' && streamRef.current) {
      applyFocusSettings();
    }
  }, [focusMode, focusDistance]);
  
  // Extracted the focus setting logic to a separate function
  const applyFocusSettings = async () => {
    if (!streamRef.current) return;
    
    try {
      const track = streamRef.current.getVideoTracks()[0];
      if (!track) return;
      
      const capabilities = track.getCapabilities();
      
      // Check if focus mode is supported by the device
      // @ts-ignore - focusMode might not be in types
      if (!capabilities.focusMode || !capabilities.focusMode.includes('manual')) {
        toast({
          title: 'Focus Control Unavailable',
          description: 'Your device does not support manual focus control.',
          variant: 'default'
        });
        return;
      }
      
      // Apply focus constraints using advanced constraints
      // This uses a type assertion (as any) to bypass TypeScript constraints
      // while allowing browser-specific focus controls to work
      await track.applyConstraints({
        advanced: [{
          // Using 'as any' to bypass TypeScript checking for non-standard constraints
          // that may be supported by browsers but not in the TypeScript definition
          focusMode: 'manual',
          focusDistance: focusDistance
        } as any]
      });
    } catch (error) {
      console.error('Focus control error:', error);
    }
  };
  
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
        // await new Promise(resolve => setTimeout(resolve, 1000));
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
          description: targetColor 
            ? `LED light (${targetColor}) detected, image saved and downloaded.` 
            : 'LED light detected, image saved and downloaded.',
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
      
      {detectorEnabled && (
        <LightDetector
          videoRef={videoRef}
          sensitivity={sensitivity}
          isActive={isActive && !isProcessingLight}
          onLightDetected={handleLightDetected}
          targetColor={targetColor}
          colorTolerance={colorTolerance}
          detectionRegion={detectionRegion}
        />
      )}
      
      {!detectorEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center shadow-lg">
            <p className="text-gray-900 dark:text-white font-medium mb-1">Detector Disabled</p>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Enable the detector to start capturing images
            </p>
          </div>
        </div>
      )}
      
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
