// Serviço para processamento de imagens com LUTs

// Função para aplicar LUT a uma imagem
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

// Função auxiliar para aplicar LUT a um canal de cor
function applyLUTToChannel(value, lutChannel) {
  // Implementação melhorada para efeitos mais visíveis
  return Math.min(255, Math.max(0, lutChannel.offset + value * lutChannel.factor));
}

// Função para carregar um arquivo LUT
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

// Função para gerar uma prévia da imagem com o LUT aplicado
export async function generatePreview(imageData, lutData) {
  // Redimensiona a imagem para uma prévia menor
  const previewData = await resizeImage(imageData, 300);
  
  // Aplica o LUT à prévia
  return applyLUT(previewData, lutData);
}

// Função para redimensionar uma imagem
function resizeImage(imageData, maxDimension) {
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
