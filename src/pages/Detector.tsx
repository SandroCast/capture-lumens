
import React, { useState, useEffect } from "react";
import Camera from "@/components/Camera";
import LightDetector from "@/components/LightDetector";
import Controls from "@/components/Controls";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { DetectionRegion } from "@/utils/imageProcessing";
import { toast } from "@/hooks/use-toast";

const Detector: React.FC = () => {
  // Camera states
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  
  // Capture settings
  const [sensitivity, setSensitivity] = useState<number>(80); // High default sensitivity
  const [useFlashlight, setUseFlashlight] = useState<boolean>(true);
  
  // Color detection settings
  const [targetColor, setTargetColor] = useState<string>('#ff0000'); // Default red
  const [colorTolerance, setColorTolerance] = useState<number>(30); // Default moderate tolerance
  
  // Region detection settings
  const [detectionRegion, setDetectionRegion] = useState<DetectionRegion>({
    x: 400, // 40% from left
    y: 400, // 40% from top
    width: 200, // 20% width
    height: 200, // 20% height
    enabled: false // Disabled by default
  });
  
  // Captured images
  const [capturedImages, setCapturedImages] = useState<Blob[]>([]);
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Load available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        // Request initial permission before enumeration
        await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        setAvailableCameras(videoDevices);
        
        if (videoDevices.length > 0) {
          // Try to find a back-facing camera first
          const backCamera = videoDevices.find(
            device => device.label.toLowerCase().includes('back') || 
                      device.label.toLowerCase().includes('traseira') ||
                      device.label.toLowerCase().includes('rear')
          );
          
          setSelectedCamera(backCamera?.deviceId || videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error accessing cameras:', error);
        toast({
          title: 'Camera Error',
          description: 'Could not access device cameras. Please check permissions.',
          variant: 'destructive'
        });
      }
    };
    
    getCameras();
  }, []);
  
  // Handle image capture
  const handleImageCaptured = (image: Blob) => {
    setCapturedImages(prev => [...prev, image]);
  };
  
  // This is just a placeholder function since we no longer use batch downloads
  const handleDownloadImages = () => {
    // No longer needed - kept for interface compatibility
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
      <div className="fixed top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm">
        <Link to="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold tracking-tight">LED Detector</h1>
        </Link>
        <Link to="/time-lapse">
          <Button variant="outline" className="gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Time-Lapse</span>
          </Button>
        </Link>
      </div>
      
      <div className="container px-4 py-6 mx-auto flex-1 flex flex-col mt-16">
        <div className="flex-1 flex flex-col lg:flex-row gap-6 items-center max-w-5xl mx-auto w-full">
          <div className="w-full lg:w-2/3 rounded-xl overflow-hidden shadow-xl animate-scale-in">
            {availableCameras.length > 0 && selectedCamera ? (
              <Camera
                selectedCameraId={selectedCamera}
                sensitivity={sensitivity}
                useFlashlight={useFlashlight}
                onImageCaptured={handleImageCaptured}
                targetColor={targetColor}
                colorTolerance={colorTolerance}
                detectionRegion={detectionRegion}
              />
            ) : (
              <div className="w-full h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
                <div className="text-center p-6">
                  <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-700 dark:text-gray-300">Initializing camera...</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="w-full lg:w-1/3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Controls
              sensitivity={sensitivity}
              setSensitivity={setSensitivity}
              useFlashlight={useFlashlight}
              setUseFlashlight={setUseFlashlight}
              capturedImages={capturedImages}
              isProcessing={isProcessing}
              isCapturing={availableCameras.length > 0 && !!selectedCamera}
              onDownloadImages={handleDownloadImages}
              selectedCamera={selectedCamera}
              availableCameras={availableCameras}
              onSelectCamera={setSelectedCamera}
              targetColor={targetColor}
              setTargetColor={setTargetColor}
              colorTolerance={colorTolerance}
              setColorTolerance={setColorTolerance}
              detectionRegion={detectionRegion}
              setDetectionRegion={setDetectionRegion}
            />
          </div>
        </div>
      </div>
      
      <footer className="py-4 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <p>LumenCapture © {new Date().getFullYear()} | <Link to="/" className="hover:text-primary">Return Home</Link></p>
      </footer>
    </div>
  );
};

export default Detector;
