
import { toast } from "sonner";
import JSZip from "jszip";
import { downloadBlob } from "./zipUtils";

/**
 * Creates a video from frames using HTML Canvas and MediaRecorder
 */
export const createVideoFromFrames = async (
  frames: { id: string; file: File; url: string }[],
  format: string,
  fps: number,
  quality: number,
  preserveQuality: boolean = true
): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create canvas to draw frames
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: false });
      
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      // Load all images first to determine optimal dimensions
      let maxWidth = 0;
      let maxHeight = 0;
      const images: HTMLImageElement[] = [];

      // Preload all images to find maximum dimensions
      for (const frame of frames) {
        const img = new Image();
        img.src = frame.url;
        
        await new Promise<void>((resolve) => {
          img.onload = () => {
            maxWidth = Math.max(maxWidth, img.width);
            maxHeight = Math.max(maxHeight, img.height);
            images.push(img);
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${frame.url}`);
            resolve(); // Continue even if one frame fails
          };
        });
      }

      // Set canvas dimensions to the maximum found (to maintain aspect ratio)
      canvas.width = maxWidth;
      canvas.height = maxHeight;

      // Set up MediaRecorder with appropriate MIME type and high bitrate
      const mimeType = format === 'webm' 
        ? 'video/webm;codecs=vp9' 
        : 'video/mp4;codecs=h264';
      
      // Fallback to WebM if MP4 is not supported
      const actualMimeType = MediaRecorder.isTypeSupported(mimeType) 
        ? mimeType 
        : 'video/webm';
      
      // Calculate higher bitrate based on resolution and quality
      // Higher quality factor for better visual results
      const qualityFactor = quality / 100;
      const videoBitsPerSecond = preserveQuality
        ? Math.max(8000000 * qualityFactor, 4000000) // Minimum 4Mbps, up to 8Mbps
        : 1000000 * qualityFactor; // Lower bitrate if preserve quality is off
      
      const stream = canvas.captureStream();
      const recorder = new MediaRecorder(stream, {
        mimeType: actualMimeType,
        videoBitsPerSecond
      });
      
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: actualMimeType });
        resolve(blob);
      };
      
      recorder.onerror = (e) => {
        reject(e);
      };
      
      // Start recording
      recorder.start();
      
      // Draw each frame at appropriate intervals
      let frameIndex = 0;
      const frameInterval = 1000 / fps; // Milliseconds between frames
      
      const drawNextFrame = () => {
        if (frameIndex >= images.length) {
          recorder.stop();
          return;
        }
        
        const img = images[frameIndex];
        
        if (img) {
          // Clear the canvas
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Calculate position to center the image and maintain aspect ratio
          const x = (canvas.width - img.width) / 2;
          const y = (canvas.height - img.height) / 2;
          
          // Draw the image centered
          ctx.drawImage(img, x, y, img.width, img.height);
        }
        
        frameIndex++;
        setTimeout(drawNextFrame, frameInterval);
      };
      
      // Start drawing frames
      drawNextFrame();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Creates a GIF from frames using a canvas-based approach
 */
export const createGifFromFrames = async (
  frames: { id: string; file: File; url: string }[],
  fps: number,
  quality: number,
  preserveQuality: boolean = true
): Promise<Blob> => {
  // For simplicity, we'll use the same video method but convert to GIF format
  // In a real application, you would use a dedicated GIF library
  // This is just a placeholder that creates a zip file for now
  const zip = new JSZip();
  
  for (let i = 0; i < frames.length; i++) {
    const response = await fetch(frames[i].url);
    const blob = await response.blob();
    const filename = `frame_${String(i + 1).padStart(4, '0')}.jpg`;
    zip.file(filename, blob);
  }
  
  return await zip.generateAsync({ type: 'blob' });
};

/**
 * Exports the timelapse based on the selected format
 */
export const exportTimeLapse = async (
  frames: { id: string; file: File; url: string }[],
  format: string,
  quality: number,
  frameDelay: number,
  preserveQuality: boolean = true
): Promise<void> => {
  if (frames.length === 0) {
    toast.error("Não há frames para exportar");
    return;
  }
  
  const fps = Math.round(1000 / frameDelay);
  
  toast.loading("Preparando a exportação do time-lapse...");
  
  try {
    let blob: Blob;
    let filename: string;
    
    // Export different formats
    switch (format) {
      case 'gif':
        blob = await createGifFromFrames(frames, fps, quality, preserveQuality);
        filename = `timelapse_${new Date().toISOString().replace(/:/g, '-')}.gif`;
        break;
      case 'mp4':
        blob = await createVideoFromFrames(frames, 'mp4', fps, quality, preserveQuality);
        filename = `timelapse_${new Date().toISOString().replace(/:/g, '-')}.mp4`;
        break;
      case 'webm':
        blob = await createVideoFromFrames(frames, 'webm', fps, quality, preserveQuality);
        filename = `timelapse_${new Date().toISOString().replace(/:/g, '-')}.webm`;
        break;
      default:
        blob = await createVideoFromFrames(frames, 'mp4', fps, quality, preserveQuality);
        filename = `timelapse_${new Date().toISOString().replace(/:/g, '-')}.mp4`;
    }
    
    // Download the file
    downloadBlob(blob, filename);
    
    toast.dismiss();
    toast.success("Time-lapse exportado com sucesso!");
  } catch (error) {
    console.error("Erro ao exportar time-lapse:", error);
    toast.dismiss();
    toast.error("Erro ao exportar time-lapse. Tente novamente.");
  }
};
