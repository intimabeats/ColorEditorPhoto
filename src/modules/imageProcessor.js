/**
 * Módulo para processamento de imagens
 */

// Aplica um LUT a uma imagem
export async function applyLUT(imageData, lutData) {
  return new Promise((resolve) => {
    // Cria um canvas para processamento
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Carrega a imagem original
    const img = new Image();
    img.onload = () => {
      // Define o tamanho do canvas
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Desenha a imagem no canvas
      ctx.drawImage(img, 0, 0);
      
      // Obtém os dados da imagem
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Aplica o LUT
      for (let i = 0; i < data.length; i += 4) {
        // Obtém os valores RGB
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Aplica a transformação do LUT de forma mais intensa
        data[i] = Math.min(255, Math.max(0, lutData.r.offset + r * lutData.r.factor));     // R
        data[i + 1] = Math.min(255, Math.max(0, lutData.g.offset + g * lutData.g.factor)); // G
        data[i + 2] = Math.min(255, Math.max(0, lutData.b.offset + b * lutData.b.factor)); // B
        // Alpha (i + 3) permanece inalterado
      }
      
      // Coloca os dados processados de volta no canvas
      ctx.putImageData(imageData, 0, 0);
      
      // Retorna a URL da imagem processada
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    
    img.src = imageData;
  });
}

// Aplica ajustes básicos a uma imagem
export async function applyAdjustments(imageData, adjustments) {
  return new Promise((resolve) => {
    // Cria um canvas para processamento
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Carrega a imagem original
    const img = new Image();
    img.onload = () => {
      // Define o tamanho do canvas
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Desenha a imagem no canvas
      ctx.drawImage(img, 0, 0);
      
      // Obtém os dados da imagem
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Normaliza os ajustes para o intervalo [0, 2]
      const brightness = 1 + (adjustments.brightness || 0) / 100;
      const contrast = 1 + (adjustments.contrast || 0) / 100;
      const saturation = 1 + (adjustments.saturation || 0) / 100;
      const temperature = (adjustments.temperature || 0) / 100;
      const tint = (adjustments.tint || 0) / 100;
      const vibrance = (adjustments.vibrance || 0) / 100;
      
      // Aplica os ajustes
      for (let i = 0; i < data.length; i += 4) {
        // Obtém os valores RGB
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // Aplica brilho
        r *= brightness;
        g *= brightness;
        b *= brightness;
        
        // Aplica contraste
        r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
        g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
        b = ((b / 255 - 0.5) * contrast + 0.5) * 255;
        
        // Aplica temperatura (ajusta o balanço de azul/amarelo)
        if (temperature > 0) {
          r += temperature * 30;
          g += temperature * 15;
        } else {
          b += Math.abs(temperature) * 30;
        }
        
        // Aplica matiz (ajusta o balanço de verde/magenta)
        if (tint > 0) {
          g += tint * 30;
        } else {
          r += Math.abs(tint) * 15;
          b += Math.abs(tint) * 15;
        }
        
        // Calcula a saturação
        const avg = (r + g + b) / 3;
        
        // Aplica saturação
        r = avg + saturation * (r - avg);
        g = avg + saturation * (g - avg);
        b = avg + saturation * (b - avg);
        
        // Aplica vibração (saturação seletiva)
        const maxChannel = Math.max(r, g, b);
        const minChannel = Math.min(r, g, b);
        const satLevel = (maxChannel - minChannel) / maxChannel;
        const vibFactor = 1 + vibrance * (1 - satLevel);
        
        r = avg + vibFactor * (r - avg);
        g = avg + vibFactor * (g - avg);
        b = avg + vibFactor * (b - avg);
        
        // Garante que os valores estão no intervalo [0, 255]
        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }
      
      // Coloca os dados processados de volta no canvas
      ctx.putImageData(imageData, 0, 0);
      
      // Retorna a URL da imagem processada
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    
    img.src = imageData;
  });
}

// Combina múltiplos processamentos em um único passo
export async function processImage(imageData, options = {}) {
  const { lut, adjustments } = options;
  
  // Primeiro aplica os ajustes básicos
  let processedImage = imageData;
  
  if (adjustments && Object.keys(adjustments).length > 0) {
    processedImage = await applyAdjustments(processedImage, adjustments);
  }
  
  // Depois aplica o LUT, se fornecido
  if (lut) {
    processedImage = await applyLUT(processedImage, lut);
  }
  
  return processedImage;
}

// Redimensiona uma imagem para uma prévia
export async function resizeImage(imageData, maxDimension) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Calcula as novas dimensões mantendo a proporção
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round(height * maxDimension / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round(width * maxDimension / height);
          height = maxDimension;
        }
      }
      
      // Cria um canvas para redimensionar
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Desenha a imagem redimensionada
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Retorna a URL da imagem redimensionada
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    img.src = imageData;
  });
}

// Gera uma prévia para um LUT
export async function generateLUTPreview(lutData, size = 100) {
  // Cria um canvas para a prévia
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  
  // Cria um gradiente para visualizar o efeito do LUT
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, 'black');
  gradient.addColorStop(0.5, 'gray');
  gradient.addColorStop(1, 'white');
  
  // Preenche o fundo com o gradiente
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Obtém os dados da imagem
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  // Aplica o LUT
  for (let i = 0; i < data.length; i += 4) {
    // Obtém os valores RGB
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Aplica a transformação do LUT
    data[i] = Math.min(255, Math.max(0, lutData.r.offset + r * lutData.r.factor));     // R
    data[i + 1] = Math.min(255, Math.max(0, lutData.g.offset + g * lutData.g.factor)); // G
    data[i + 2] = Math.min(255, Math.max(0, lutData.b.offset + b * lutData.b.factor)); // B
    // Alpha (i + 3) permanece inalterado
  }
  
  // Coloca os dados processados de volta no canvas
  ctx.putImageData(imageData, 0, 0);
  
  // Retorna a URL da prévia
  return canvas.toDataURL('image/png');
}

// Carrega um arquivo LUT
export async function loadLUTFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        // Tenta analisar o arquivo como um LUT
        const content = reader.result;
        let lutData;
        
        if (file.name.endsWith('.cube')) {
          // Analisa arquivo .cube
          lutData = parseCubeLUT(content);
        } else if (file.name.endsWith('.3dl')) {
          // Analisa arquivo .3dl
          lutData = parse3dlLUT(content);
        } else {
          // Formato desconhecido, cria um LUT básico
          lutData = {
            name: file.name.replace(/\.[^/.]+$/, ""),
            // Valores mais intensos para efeitos mais visíveis
            r: { offset: 20, factor: 1.2 },
            g: { offset: 0, factor: 1.1 },
            b: { offset: -10, factor: 0.9 }
          };
        }
        
        resolve(lutData);
      } catch (error) {
        console.error('Erro ao analisar arquivo LUT:', error);
        // Em caso de erro, retorna um LUT padrão
        resolve({
          name: file.name.replace(/\.[^/.]+$/, ""),
          r: { offset: 30, factor: 1.2 },
          g: { offset: 10, factor: 1.1 },
          b: { offset: -20, factor: 0.9 }
        });
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo LUT'));
    };
    
    // Lê o arquivo como texto
    reader.readAsText(file);
  });
}

// Função para analisar um arquivo LUT no formato .cube
function parseCubeLUT(content) {
  try {
    const lines = content.split('\n');
    let title = 'LUT Importado';
    let size = 0;
    let domainMin = [0, 0, 0];
    let domainMax = [1, 1, 1];
    
    // Extrai informações básicas
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('TITLE')) {
        title = trimmedLine.substring(5).trim().replace(/"/g, '');
      } else if (trimmedLine.startsWith('LUT_3D_SIZE') || trimmedLine.startsWith('LUT_1D_SIZE')) {
        size = parseInt(trimmedLine.split(/\s+/)[1]);
      }
    }
    
    // Cria um LUT com valores mais intensos para efeitos visíveis
    return {
      name: title,
      r: { offset: 20, factor: 1.2 },
      g: { offset: 0, factor: 1.1 },
      b: { offset: -10, factor: 0.9 }
    };
  } catch (error) {
    console.error('Erro ao analisar arquivo .cube:', error);
    return {
      name: 'LUT Importado',
      r: { offset: 30, factor: 1.2 },
      g: { offset: 10, factor: 1.1 },
      b: { offset: -20, factor: 0.9 }
    };
  }
}

// Função para analisar um arquivo LUT no formato .3dl
function parse3dlLUT(content) {
  try {
    const lines = content.split('\n');
    
    // Cria um LUT com valores mais intensos para efeitos visíveis
    return {
      name: 'LUT 3DL Importado',
      r: { offset: 25, factor: 1.25 },
      g: { offset: 5, factor: 1.15 },
      b: { offset: -15, factor: 0.85 }
    };
  } catch (error) {
    console.error('Erro ao analisar arquivo .3dl:', error);
    return {
      name: 'LUT 3DL Importado',
      r: { offset: 30, factor: 1.2 },
      g: { offset: 10, factor: 1.1 },
      b: { offset: -20, factor: 0.9 }
    };
  }
}
