/**
 * Analyzes an image from a canvas to detect bright spots (potential LED lights)
 * Returns true if a light is detected based on sensitivity threshold and color matching
 */
export const detectLight = (
  canvas: HTMLCanvasElement,
  sensitivity: number,
  targetColor?: { r: number, g: number, b: number }
): { detected: boolean; brightestPoint: { x: number; y: number } } => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { detected: false, brightestPoint: { x: 0, y: 0 } };

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let maxBrightness = 0;
  let brightestX = 0;
  let brightestY = 0;
  
  // Normalize sensitivity (0-100) to appropriate threshold (0-255)
  const threshold = 255 - (sensitivity * 2.55);
  
  // Sample pixels at intervals for performance
  const sampleInterval = 4; // Adjust based on performance needs
  
  // Color matching tolerance (0-255)
  const colorTolerance = 50;
  
  for (let y = 0; y < canvas.height; y += sampleInterval) {
    for (let x = 0; x < canvas.width; x += sampleInterval) {
      const i = (y * canvas.width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate brightness using perceived luminance formula
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
      
      // Check if brightness exceeds threshold and if color matching is required
      if (brightness > threshold) {
        // If no target color specified, or if the color matches the target color
        if (!targetColor || isColorMatch(r, g, b, targetColor, colorTolerance)) {
          if (brightness > maxBrightness) {
            maxBrightness = brightness;
            brightestX = x;
            brightestY = y;
          }
        }
      }
    }
  }
  
  return {
    detected: maxBrightness > threshold,
    brightestPoint: { x: brightestX, y: brightestY }
  };
};

/**
 * Helper function to check if a pixel's color matches the target color within tolerance
 */
const isColorMatch = (
  r: number, 
  g: number, 
  b: number, 
  targetColor: { r: number, g: number, b: number },
  tolerance: number
): boolean => {
  return (
    Math.abs(r - targetColor.r) <= tolerance &&
    Math.abs(g - targetColor.g) <= tolerance &&
    Math.abs(b - targetColor.b) <= tolerance
  );
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

/**
 * Convert hex color to RGB object
 */
export const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};
