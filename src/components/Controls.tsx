
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

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
  targetColor: string;
  setTargetColor: (color: string) => void;
  colorTolerance: number;
  setColorTolerance: (value: number) => void;
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
  onSelectCamera,
  targetColor,
  setTargetColor,
  colorTolerance,
  setColorTolerance
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
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="target-color" className="text-sm font-medium block mb-2">Target LED Color</Label>
            <div className="flex items-center gap-3">
              <input
                id="target-color"
                type="color"
                value={targetColor}
                onChange={(e) => setTargetColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <div className="text-xs">{targetColor}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Color Tolerance</h3>
              <span className="text-xs">{colorTolerance}</span>
            </div>
            <Slider 
              value={[colorTolerance]} 
              min={0} 
              max={100} 
              step={1}
              onValueChange={(value) => setColorTolerance(value[0])}
              className="mt-2"
            />
            <div className="text-xs opacity-70">Higher values allow detecting similar colors</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Light Sensitivity</h3>
            <span className="text-xs">{sensitivity}%</span>
          </div>
          
          <Slider 
            value={[sensitivity]} 
            min={0} 
            max={5} 
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
