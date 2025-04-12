import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Upload, Play, Pause, RotateCcw, Download, Settings, Trash2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FileUploader } from '@/components/FileUploader';
import { FramesTimeline } from '@/components/FramesTimeline';
import { TimeLapsePreview } from '@/components/TimeLapsePreview';
import { ExportSettings } from '@/components/ExportSettings';
import { exportTimeLapse } from '@/utils/exportUtils';

const TimeLapse: React.FC = () => {
  const navigate = useNavigate();
  const [frames, setFrames] = useState<{ id: string; file: File; url: string }[]>([]);
  const [frameDelay, setFrameDelay] = useState(100); // milliseconds per frame
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [selectedFrames, setSelectedFrames] = useState<Set<string>>(new Set());
  const [exportFormat, setExportFormat] = useState('mp4');
  const [exportQuality, setExportQuality] = useState(80);

  // Handle frame upload
  const handleFilesAdded = (files: File[]) => {
    if (files.length === 0) return;
    
    const newFrames = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file)
    }));

    setFrames((prev) => [...prev, ...newFrames]);
    toast.success(`${files.length} ${files.length === 1 ? 'imagem adicionada' : 'imagens adicionadas'} com sucesso`);
  };

  // Handle frame deletion
  const handleDeleteFrames = () => {
    if (selectedFrames.size === 0) return;
    
    // Revoke object URLs to prevent memory leaks
    frames
      .filter(frame => selectedFrames.has(frame.id))
      .forEach(frame => URL.revokeObjectURL(frame.url));
    
    setFrames(frames.filter(frame => !selectedFrames.has(frame.id)));
    setSelectedFrames(new Set());
    toast.success(`${selectedFrames.size} frame${selectedFrames.size > 1 ? 's' : ''} removido${selectedFrames.size > 1 ? 's' : ''}`);
  };

  // Handle frame selection
  const toggleFrameSelection = (id: string) => {
    const newSelection = new Set(selectedFrames);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedFrames(newSelection);
  };

  // Handle playback toggle
  const togglePlayback = () => {
    setIsPlaying(prev => !prev);
  };

  // Reset time lapse
  const resetTimeLapse = () => {
    setSelectedFrames(new Set());
    setCurrentFrameIndex(0);
    setIsPlaying(false);
  };

  // Export time lapse as video
  const handleExport = async (format: string, quality: number) => {
    setExportFormat(format);
    setExportQuality(quality);
    await exportTimeLapse(frames, format, quality, frameDelay);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Editor de Time-Lapse</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-black rounded-lg overflow-hidden mb-4">
            <TimeLapsePreview 
              frames={frames}
              currentFrameIndex={currentFrameIndex}
              setCurrentFrameIndex={setCurrentFrameIndex}
              isPlaying={isPlaying}
              frameDelay={frameDelay}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg mb-4">
            <Button variant={isPlaying ? "destructive" : "default"} onClick={togglePlayback}>
              {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isPlaying ? "Pausar" : "Reproduzir"}
            </Button>
            
            <div className="flex-1 mx-4">
              <Slider 
                value={[frameDelay]} 
                min={33} 
                max={1000} 
                step={1}
                onValueChange={(value) => setFrameDelay(value[0])}
              />
              <div className="flex justify-between text-xs mt-1 text-gray-300">
                <span>Rápido (30 FPS)</span>
                <span>Velocidade: {Math.round(1000 / frameDelay)} FPS</span>
                <span>Lento (1 FPS)</span>
              </div>
            </div>
            
            <Button variant="outline" onClick={resetTimeLapse}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reiniciar
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Tabs defaultValue="upload">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="frames">Frames</TabsTrigger>
              <TabsTrigger value="export">Exportar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <FileUploader onFilesAdded={handleFilesAdded} />
              
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">
                  {frames.length > 0 
                    ? `${frames.length} frame${frames.length !== 1 ? 's' : ''} carregado${frames.length !== 1 ? 's' : ''}`
                    : 'Nenhum frame carregado ainda'}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="frames">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium">Frames ({frames.length})</h3>
                {selectedFrames.size > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDeleteFrames}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir ({selectedFrames.size})
                  </Button>
                )}
              </div>
              
              <div className="bg-gray-800 rounded-lg p-2 h-[400px] overflow-y-auto">
                <FramesTimeline 
                  frames={frames}
                  currentFrameIndex={currentFrameIndex}
                  setCurrentFrameIndex={setCurrentFrameIndex}
                  selectedFrames={selectedFrames}
                  toggleFrameSelection={toggleFrameSelection}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="export">
              <ExportSettings 
                frameCount={frames.length}
                frameDelay={frameDelay}
                onExport={(format, quality) => handleExport(format, quality)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TimeLapse;
