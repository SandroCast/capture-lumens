
import React, { useState, useRef, useEffect } from "react";
import Camera from "@/components/Camera";
import LightDetector from "@/components/LightDetector";
import Controls from "@/components/Controls";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Video } from "lucide-react";
import { DetectionRegion } from "@/utils/imageProcessing";
import { toast } from "@/hooks/use-toast";

const Index: React.FC = () => {
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full p-4 flex justify-between items-center z-10">
        <h1 className="text-2xl font-bold tracking-tight">Detector de LED</h1>
        <Link to="/time-lapse">
          <Button variant="outline" className="gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Time-Lapse</span>
          </Button>
        </Link>
      </div>
      
      <div className="container px-4 py-6 mx-auto flex-1 flex flex-col">
        <header className="text-center mb-6 animate-fade-in">
          <h1 className="text-2xl font-light tracking-tight text-gray-900">Capture Lumens</h1>
          <p className="text-sm text-gray-500">Automatic light detection and capture</p>
        </header>
        
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
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
                <div className="text-center p-6">
                  <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Initializing camera...</p>
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
      
      <footer className="text-center p-4 text-sm text-gray-400">
        <p>Keep the app open to continue detecting lights</p>
      </footer>
    </div>
  );
};

export default Index;
