
import JSZip from 'jszip';

/**
 * Creates a zip file containing all captured images
 */
export const createImagesZip = async (images: Blob[]): Promise<Blob> => {
  const zip = new JSZip();
  
  // Add each image to the zip file with a sequential filename
  images.forEach((imageBlob, index) => {
    const filename = `capture_${String(index + 1).padStart(3, '0')}.jpg`;
    zip.file(filename, imageBlob);
  });
  
  // Generate the zip file as a blob
  return await zip.generateAsync({ type: 'blob' });
};

/**
 * Triggers a download of the provided blob with the given filename
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};
