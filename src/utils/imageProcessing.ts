
/**
 * Analyzes an image from a canvas to detect bright spots (potential LED lights)
 * Returns true if a light is detected based on sensitivity threshold
 */
export const detectLight = (
  canvas: HTMLCanvasElement,
  sensitivity: number
): { detected: boolean; brightestPoint: { x: number; y: number } } => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { detected: false, brightestPoint: { x: 0, y: 0 } };

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let maxBrightness = 0;
  let brightestX = 0;
  let brightestY = 0;
  
  // Sample pixels at intervals for performance
  const sampleInterval = 4; // Adjust based on performance needs
  
  for (let y = 0; y < canvas.height; y += sampleInterval) {
    for (let x = 0; x < canvas.width; x += sampleInterval) {
      const i = (y * canvas.width + x) * 4;
      
      // Calculate brightness using perceived luminance formula
      const brightness = 
        (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      
      if (brightness > maxBrightness) {
        maxBrightness = brightness;
        brightestX = x;
        brightestY = y;
      }
    }
  }
  
  // Normalize sensitivity (0-100) to appropriate threshold (0-255)
  const threshold = 255 - (sensitivity * 2.55);
  
  return {
    detected: maxBrightness > threshold,
    brightestPoint: { x: brightestX, y: brightestY }
  };
};

/**
 * Captures an image from video stream
 */
export const captureImage = (
  videoElement: HTMLVideoElement
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw the current video frame to the canvas
      ctx.drawImage(videoElement, 0, 0);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob conversion failed'));
        }
      }, 'image/jpeg', 0.95); // High quality JPEG
    } catch (error) {
      reject(error);
    }
  });
};
