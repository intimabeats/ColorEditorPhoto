// Utilitários para manipulação de arquivos

// Converte um arquivo para Data URL
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = (e) => {
      reject(new Error('Erro ao ler o arquivo'));
    };
    
    reader.readAsDataURL(file);
  });
}

// Converte um Data URL para Blob
export function dataURLToBlob(dataURL) {
  // Extrai o tipo MIME e os dados
  const parts = dataURL.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  
  // Converte para ArrayBuffer
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
}

// Redimensiona uma imagem
export function resizeImage(file, maxWidth, maxHeight) {
  return new Promise((resolve, reject) => {
    // Cria um objeto URL para o arquivo
    const url = URL.createObjectURL(file);
    
    // Cria um elemento de imagem
    const img = new Image();
    img.onload = () => {
      // Revoga o URL para liberar memória
      URL.revokeObjectURL(url);
      
      // Calcula as dimensões mantendo a proporção
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * maxHeight / height);
          height = maxHeight;
        }
      }
      
      // Cria um canvas para redimensionar
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Desenha a imagem redimensionada
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Converte o canvas para Blob
      canvas.toBlob((blob) => {
        resolve(blob);
      }, file.type);
    };
    
    img.onerror = () => {
      // Revoga o URL em caso de erro
      URL.revokeObjectURL(url);
      reject(new Error('Erro ao carregar a imagem'));
    };
    
    // Carrega a imagem
    img.src = url;
  });
}

// Verifica se um arquivo é uma imagem
export function isImageFile(file) {
  return file.type.startsWith('image/');
}

// Obtém a extensão de um arquivo
export function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}
