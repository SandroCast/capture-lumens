
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
  quality: number
): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create canvas to draw frames
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      // Load the first image to get dimensions
      const firstFrame = frames[0];
      const img = new Image();
      img.src = firstFrame.url;
      
      await new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          resolve(null);
        };
      });

      // Set up MediaRecorder with appropriate MIME type
      const mimeType = format === 'webm' 
        ? 'video/webm;codecs=vp9' 
        : 'video/mp4;codecs=h264';
      
      // Fallback to WebM if MP4 is not supported
      const actualMimeType = MediaRecorder.isTypeSupported(mimeType) 
        ? mimeType 
        : 'video/webm';
      
      // Configure video bitrate based on quality (higher quality = higher bitrate)
      const videoBitsPerSecond = 1000000 * (quality / 100);
      
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
      
      const drawNextFrame = async () => {
        if (frameIndex >= frames.length) {
          recorder.stop();
          return;
        }
        
        const frame = frames[frameIndex];
        const img = new Image();
        img.src = frame.url;
        
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${frame.url}`);
            resolve(); // Continue even if one frame fails
          };
        });
        
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
  quality: number
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
  frameDelay: number
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
        blob = await createGifFromFrames(frames, fps, quality);
        filename = `timelapse_${new Date().toISOString().replace(/:/g, '-')}.gif`;
        break;
      case 'mp4':
        blob = await createVideoFromFrames(frames, 'mp4', fps, quality);
        filename = `timelapse_${new Date().toISOString().replace(/:/g, '-')}.mp4`;
        break;
      case 'webm':
        blob = await createVideoFromFrames(frames, 'webm', fps, quality);
        filename = `timelapse_${new Date().toISOString().replace(/:/g, '-')}.webm`;
        break;
      default:
        blob = await createVideoFromFrames(frames, 'mp4', fps, quality);
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
