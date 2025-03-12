
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Info } from 'lucide-react';

interface ExportSettingsProps {
  frameCount: number;
  frameDelay: number;
  onExport: (format: string, quality: number) => void;
}

export const ExportSettings: React.FC<ExportSettingsProps> = ({
  frameCount,
  frameDelay,
  onExport,
}) => {
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState(80);
  const [resolution, setResolution] = useState('original');
  
  // Calculate estimated duration and file size
  const fps = Math.round(1000 / frameDelay);
  const duration = frameCount / fps;
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  
  // This is a very rough estimate and would need to be refined in a real app
  const estimatedFileSizeMB = (frameCount * quality * 0.005).toFixed(1);

  return (
    <div className="space-y-4 bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4 text-white">Configurações de Exportação</h3>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="format" className="text-gray-200">Formato de vídeo</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger id="format" className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Selecione o formato" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600 text-white">
              <SelectItem value="mp4">MP4 (H.264)</SelectItem>
              <SelectItem value="webm">WebM</SelectItem>
              <SelectItem value="gif">GIF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="quality" className="text-gray-200">Qualidade</Label>
            <span className="text-xs text-gray-300">{quality}%</span>
          </div>
          <Slider 
            id="quality" 
            min={10} 
            max={100} 
            step={5}
            value={[quality]}
            onValueChange={(value) => setQuality(value[0])}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Menor tamanho</span>
            <span>Melhor qualidade</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resolution" className="text-gray-200">Resolução</Label>
          <Select value={resolution} onValueChange={setResolution}>
            <SelectTrigger id="resolution" className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Selecione a resolução" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600 text-white">
              <SelectItem value="original">Original</SelectItem>
              <SelectItem value="1080p">1080p</SelectItem>
              <SelectItem value="720p">720p</SelectItem>
              <SelectItem value="480p">480p</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="bg-blue-500 bg-opacity-10 border border-blue-600 rounded-lg p-3">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-2 text-gray-200">Detalhes do time-lapse:</p>
              <ul className="space-y-1 text-xs text-gray-300">
                <li><span className="font-medium text-gray-200">Frames:</span> {frameCount}</li>
                <li><span className="font-medium text-gray-200">FPS:</span> {fps}</li>
                <li><span className="font-medium text-gray-200">Duração:</span> {minutes}:{seconds.toString().padStart(2, '0')}</li>
                <li><span className="font-medium text-gray-200">Tamanho estimado:</span> ~{estimatedFileSizeMB} MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full mt-6" 
        disabled={frameCount === 0}
        onClick={() => onExport(format, quality)}
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar time-lapse
      </Button>
      
      {frameCount === 0 && (
        <p className="text-xs text-yellow-500 text-center mt-2">
          Adicione algumas imagens antes de exportar
        </p>
      )}
    </div>
  );
};
