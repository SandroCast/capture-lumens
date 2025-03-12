
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Image, FileText } from 'lucide-react';

interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesAdded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesAdded(filesArray);
      
      // Reset the input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      // Filter only image files
      const imageFiles = filesArray.filter((file) => file.type.startsWith('image/'));
      onFilesAdded(imageFiles);
    }
  };

  return (
    <div 
      className={`p-6 border-2 border-dashed rounded-lg text-center space-y-4 transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50 bg-opacity-10' : 'border-gray-600'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <Image className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Adicionar imagens ao time-lapse</h3>
        <p className="text-sm text-gray-400 mb-4">
          Arraste e solte imagens aqui ou clique para selecionar
        </p>
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center"
        >
          <Upload className="mr-2 h-4 w-4" />
          Selecionar arquivos
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          multiple 
          accept="image/*" 
          className="hidden" 
        />
        <p className="text-xs mt-4 text-gray-500">
          Suporta JPG, PNG, GIF e outros formatos de imagem
        </p>
      </div>
    </div>
  );
};
