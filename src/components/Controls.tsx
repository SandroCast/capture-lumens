
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface ControlsProps {
  sensitivity: number;
  setSensitivity: (value: number) => void;
  useFlashlight: boolean;
  setUseFlashlight: (value: boolean) => void;
  capturedImages: Blob[];
  isProcessing: boolean;
  isCapturing: boolean;
  onDownloadImages: () => void;
  selectedCamera: string;
  availableCameras: MediaDeviceInfo[];
  onSelectCamera: (deviceId: string) => void;
}

const Controls: React.FC<ControlsProps> = ({
  sensitivity,
  setSensitivity,
  useFlashlight,
  setUseFlashlight,
  capturedImages,
  isCapturing,
  selectedCamera,
  availableCameras,
  onSelectCamera
}) => {
  return (
    <div className="glass-panel p-6 w-full max-w-md mx-auto animate-blur-in">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Camera</h3>
            {isCapturing && <Badge className="bg-blue-500 animate-pulse-light">Active</Badge>}
          </div>
          
          <select 
            value={selectedCamera}
            onChange={(e) => onSelectCamera(e.target.value)}
            className="w-full px-3 py-2 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg border border-white border-opacity-20"
          >
            {availableCameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Camera ${availableCameras.indexOf(camera) + 1}`}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Light Sensitivity</h3>
            <span className="text-xs">{sensitivity}%</span>
          </div>
          
          <Slider 
            value={[sensitivity]} 
            min={0} 
            max={100} 
            step={0.1}
            onValueChange={(value) => setSensitivity(value[0])}
            className="mt-2"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Use Flashlight</h3>
          <Switch 
            checked={useFlashlight} 
            onCheckedChange={setUseFlashlight}
          />
        </div>
        
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Captured Images</h3>
            <Badge variant="outline">{capturedImages.length}</Badge>
          </div>
          
          <div className="text-xs text-center text-green-600 font-medium">
            Images are automatically downloaded after capture
          </div>
        </div>
        
        <div className="text-xs text-center opacity-70 mt-4">
          <p>The screen will stay awake while capturing</p>
        </div>
      </div>
    </div>
  );
};

export default Controls;
