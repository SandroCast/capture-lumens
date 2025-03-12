import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DetectionRegion } from '../utils/imageProcessing';

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
  detectionRegion: DetectionRegion;
  setDetectionRegion: (region: DetectionRegion) => void;
  detectorEnabled: boolean;
  setDetectorEnabled: (enabled: boolean) => void;
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
  setColorTolerance,
  detectionRegion,
  setDetectionRegion,
  detectorEnabled,
  setDetectorEnabled
}) => {
  const [showRegionSettings, setShowRegionSettings] = useState(false);
  
  // Handler for region changes
  const handleRegionChange = (property: keyof DetectionRegion, value: any) => {
    setDetectionRegion({
      ...detectionRegion,
      [property]: value
    });
  };
  
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
        
        {/* LED Detector Enable/Disable Switch */}
        <div className="flex items-center justify-between pt-2 border-t border-white border-opacity-10">
          <h3 className="text-sm font-medium">LED Detector</h3>
          <Switch 
            checked={detectorEnabled} 
            onCheckedChange={setDetectorEnabled}
          />
        </div>
        <div className="text-xs opacity-70">
          {detectorEnabled 
            ? "Detector is activated - will capture images automatically when light is detected"
            : "Detector is deactivated - no automatic captures will occur"}
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
        
        {/* Detection Region Section */}
        <div className="space-y-2 pt-2 border-t border-white border-opacity-10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Detection Region</h3>
            <Switch 
              checked={detectionRegion.enabled} 
              onCheckedChange={(checked) => handleRegionChange('enabled', checked)}
            />
          </div>
          
          {detectionRegion.enabled && (
            <button
              type="button"
              onClick={() => setShowRegionSettings(!showRegionSettings)}
              className="w-full text-xs text-blue-500 hover:text-blue-600 transition-colors text-left mt-1"
            >
              {showRegionSettings ? 'Hide Region Settings' : 'Configure Region Settings'}
            </button>
          )}
          
          {detectionRegion.enabled && showRegionSettings && (
            <div className="space-y-3 mt-2 p-3 bg-white bg-opacity-10 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="region-x" className="text-xs">X Position (%)</Label>
                  <span className="text-xs">{Math.round(detectionRegion.x / 10)}%</span>
                </div>
                <Slider 
                  id="region-x"
                  value={[detectionRegion.x]} 
                  min={0} 
                  max={2000} 
                  step={10}
                  onValueChange={(value) => handleRegionChange('x', value[0])}
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="region-y" className="text-xs">Y Position (%)</Label>
                  <span className="text-xs">{Math.round(detectionRegion.y / 10)}%</span>
                </div>
                <Slider 
                  id="region-y"
                  value={[detectionRegion.y]} 
                  min={0} 
                  max={2000} 
                  step={10}
                  onValueChange={(value) => handleRegionChange('y', value[0])}
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="region-width" className="text-xs">Width (%)</Label>
                  <span className="text-xs">{Math.round(detectionRegion.width / 10)}%</span>
                </div>
                <Slider 
                  id="region-width"
                  value={[detectionRegion.width]} 
                  min={100} 
                  max={1000} 
                  step={10}
                  onValueChange={(value) => handleRegionChange('width', value[0])}
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="region-height" className="text-xs">Height (%)</Label>
                  <span className="text-xs">{Math.round(detectionRegion.height / 10)}%</span>
                </div>
                <Slider 
                  id="region-height"
                  value={[detectionRegion.height]} 
                  min={100} 
                  max={1000} 
                  step={10}
                  onValueChange={(value) => handleRegionChange('height', value[0])}
                />
              </div>
            </div>
          )}
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
