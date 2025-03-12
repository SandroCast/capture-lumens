
/**
 * Redimensiona uma imagem para as dimensões especificadas
 */
export const resizeImage = (
  imageFile: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.9
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(imageFile);
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      
      // Calcular as dimensões mantendo a proporção
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Criar um canvas para redimensionar a imagem
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Não foi possível obter o contexto 2D do canvas"));
        return;
      }
      
      // Desenhar a imagem redimensionada no canvas
      ctx.drawImage(img, 0, 0, width, height);
      
      // Converter o canvas para blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Falha ao converter canvas para blob"));
          }
        },
        imageFile.type,
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Erro ao carregar a imagem"));
    };
  });
};

/**
 * Processa múltiplas imagens em lote para evitar sobrecarga de memória
 */
export const batchProcessImages = async <T>(
  items: any[],
  processFn: (item: any, index: number) => Promise<T>,
  batchSize: number = 10
): Promise<T[]> => {
  const results: T[] = [];
  
  // Processar as imagens em lotes para evitar sobrecarga de memória
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map((item, batchIndex) => 
      processFn(item, i + batchIndex)
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Extrai o quadro atual de um vídeo
 */
export const extractFrameFromVideo = (
  video: HTMLVideoElement,
  time: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error("Não foi possível obter o contexto 2D do canvas"));
      return;
    }
    
    // Função para extrair o quadro quando o vídeo estiver pronto
    const extractFrame = () => {
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Falha ao converter canvas para blob"));
            }
          },
          'image/jpeg',
          0.95
        );
      } catch (error) {
        reject(error);
      }
    };
    
    // Atualizar a posição do vídeo para o tempo especificado
    video.currentTime = time;
    
    // Capturar o quadro quando o vídeo estiver pronto
    video.onseeked = extractFrame;
    
    // Lidar com erros de carregamento
    video.onerror = () => {
      reject(new Error("Erro ao carregar o vídeo"));
    };
  });
};
