
/**
 * Converts a hex color string to RGB values
 */
export const hexToRgb = (hex: string): { r: number, g: number, b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

/**
 * Calculates color difference between two RGB colors
 * Lower value means more similar colors
 */
export const colorDistance = (
  color1: { r: number, g: number, b: number },
  color2: { r: number, g: number, b: number }
): number => {
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
    Math.pow(color1.g - color2.g, 2) +
    Math.pow(color1.b - color2.b, 2)
  );
};

/**
 * Region type definition for detection zone
 */
export interface DetectionRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  enabled: boolean;
}

/**
 * Analyzes an image from a canvas to detect bright spots (potential LED lights)
 * of a specific color if targetColor is provided and within a specific region if region is provided
 * Returns true if a matching light is detected based on sensitivity threshold
 */
export const detectLight = (
  canvas: HTMLCanvasElement,
  sensitivity: number,
  targetColor?: string,
  colorTolerance?: number,
  region?: DetectionRegion
): { detected: boolean; brightestPoint: { x: number; y: number } } => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { detected: false, brightestPoint: { x: 0, y: 0 } };

  // If region is enabled, we only analyze that part of the image
  let imageData;
  let regionOffsetX = 0;
  let regionOffsetY = 0;
  
  if (region && region.enabled) {
    // Ensure region is within canvas bounds
    const safeX = Math.max(0, Math.min(region.x, canvas.width - 1));
    const safeY = Math.max(0, Math.min(region.y, canvas.height - 1));
    const safeWidth = Math.max(1, Math.min(region.width, canvas.width - safeX));
    const safeHeight = Math.max(1, Math.min(region.height, canvas.height - safeY));
    
    imageData = ctx.getImageData(safeX, safeY, safeWidth, safeHeight);
    regionOffsetX = safeX;
    regionOffsetY = safeY;
  } else {
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
  
  const data = imageData.data;
  
  let maxBrightness = 0;
  let brightestX = 0;
  let brightestY = 0;
  
  // If we're looking for a specific color, convert the hex to RGB
  const targetRgb = targetColor ? hexToRgb(targetColor) : null;
  
  // Normalize tolerance to a reasonable range (0-255)
  const maxAllowedDistance = colorTolerance ? (colorTolerance * 4.42) : 255; // 442 is approx max possible distance (sqrt(255^2 * 3))
  
  // Sample pixels at intervals for performance
  const sampleInterval = 4; // Adjust based on performance needs
  
  const width = imageData.width;
  
  for (let y = 0; y < imageData.height; y += sampleInterval) {
    for (let x = 0; x < imageData.width; x += sampleInterval) {
      const i = (y * width + x) * 4;
      
      // Get RGB values for this pixel
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate brightness using perceived luminance formula
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
      
      // If we're looking for a specific color, check if this pixel matches
      let isTargetColor = true;
      if (targetRgb) {
        const pixelColor = { r, g, b };
        const distance = colorDistance(targetRgb, pixelColor);
        isTargetColor = distance < maxAllowedDistance;
      }
      
      // Only consider this pixel if it matches our target color criteria
      if (isTargetColor && brightness > maxBrightness) {
        maxBrightness = brightness;
        brightestX = x + regionOffsetX;
        brightestY = y + regionOffsetY;
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
