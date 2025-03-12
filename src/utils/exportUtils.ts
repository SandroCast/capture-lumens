
import { toast } from "sonner";
import JSZip from "jszip";
import { downloadBlob } from "./zipUtils";

/**
 * Converts an array of frames to a GIF using a simple approach
 * This is a simplified implementation for demonstration purposes
 */
export const exportAsGif = async (
  frames: { id: string; file: File; url: string }[],
  fps: number,
  quality: number
): Promise<void> => {
  try {
    // For demonstration, we'll just compile images into a zip file
    // In a production app, you would use a library like gif.js
    const zip = new JSZip();
    
    // Add each frame to the zip with sequential naming
    for (let i = 0; i < frames.length; i++) {
      const response = await fetch(frames[i].url);
      const blob = await response.blob();
      const filename = `frame_${String(i + 1).padStart(4, '0')}.jpg`;
      zip.file(filename, blob);
    }
    
    // Generate the final zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const filename = `timelapse_${new Date().toISOString().replace(/:/g, '-')}.zip`;
    
    // Download the zip file
    downloadBlob(zipBlob, filename);
    
    toast.success("Time-lapse exportado com sucesso!");
  } catch (error) {
    console.error("Erro ao exportar time-lapse:", error);
    toast.error("Erro ao exportar time-lapse. Tente novamente.");
  }
};

/**
 * Exports the timelapse based on the selected format
 */
export const exportTimeLapse = async (
  frames: { id: string; file: File; url: string }[],
  format: string,
  quality: number,
  frameDelay: number
): Promise<void> => {
  if (frames.length === 0) {
    toast.error("Não há frames para exportar");
    return;
  }
  
  const fps = Math.round(1000 / frameDelay);
  
  toast.loading("Preparando a exportação do time-lapse...");
  
  // Different export formats
  switch (format) {
    case 'gif':
      await exportAsGif(frames, fps, quality);
      break;
    case 'mp4':
    case 'webm':
      // For demonstration, we'll just use the same approach as GIF
      // In a production app, you would use a library that can create MP4/WebM
      await exportAsGif(frames, fps, quality);
      break;
    default:
      await exportAsGif(frames, fps, quality);
  }
};
