
import React, { useState, useEffect } from 'react';
import Camera from '@/components/Camera';
import Controls from '@/components/Controls';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  // Camera states
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  
  // Capture settings
  const [sensitivity, setSensitivity] = useState<number>(80); // High default sensitivity
  const [useFlashlight, setUseFlashlight] = useState<boolean>(true);
  
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-gray-100">
      <NavBar />
      
      <div className="container px-4 py-6 mx-auto flex-1 flex flex-col">
        <header className="text-center mb-6 animate-fade-in">
          <h1 className="text-2xl font-light tracking-tight text-gray-900">Automatic Light Detection</h1>
          <p className="text-sm text-gray-500">Capture images when lights are detected</p>
        </header>
        
        <div className="flex-1 flex flex-col lg:flex-row gap-6 items-center max-w-5xl mx-auto w-full">
          <div className="w-full lg:w-2/3 rounded-xl overflow-hidden shadow-xl animate-scale-in">
            {availableCameras.length > 0 && selectedCamera ? (
              <Camera
                selectedCameraId={selectedCamera}
                sensitivity={sensitivity}
                useFlashlight={useFlashlight}
                onImageCaptured={handleImageCaptured}
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
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
