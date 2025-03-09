// Utilitários para manipulação de LUTs

// Analisa um arquivo LUT no formato .cube
export function parseCubeLUT(content) {
  try {
    const lines = content.split('\n');
    const lutData = {
      title: '',
      domainMin: [0, 0, 0],
      domainMax: [1, 1, 1],
      size: 0,
      data: []
    };
    
    let readingData = false;
    
    for (const line of lines) {
      // Remove comentários e espaços em branco
      const trimmedLine = line.split('#')[0].trim();
      if (!trimmedLine) continue;
      
      if (readingData) {
        // Lê os valores RGB
        const values = trimmedLine.split(/\s+/).map(parseFloat);
        if (values.length >= 3) {
          lutData.data.push(values.slice(0, 3));
        }
      } else {
        // Lê os metadados
        if (trimmedLine.startsWith('TITLE')) {
          lutData.title = trimmedLine.substring(5).trim().replace(/"/g, '');
        } else if (trimmedLine.startsWith('DOMAIN_MIN')) {
          lutData.domainMin = trimmedLine.substring(10).trim().split(/\s+/).map(parseFloat);
        } else if (trimmedLine.startsWith('DOMAIN_MAX')) {
          lutData.domainMax = trimmedLine.substring(10).trim().split(/\s+/).map(parseFloat);
        } else if (trimmedLine.startsWith('LUT_3D_SIZE')) {
          lutData.size = parseInt(trimmedLine.substring(11).trim());
        } else if (trimmedLine.startsWith('LUT_1D_SIZE')) {
          lutData.size = parseInt(trimmedLine.substring(11).trim());
        } else if (trimmedLine === 'LUT_3D_TABLE' || trimmedLine === 'LUT_1D_TABLE') {
          readingData = true;
        }
      }
    }
    
    return lutData;
  } catch (error) {
    console.error('Erro ao analisar arquivo LUT:', error);
    throw new Error('Formato de arquivo LUT inválido');
  }
}

// Analisa um arquivo LUT no formato .3dl
export function parse3dlLUT(content) {
  try {
    const lines = content.split('\n');
    const lutData = {
      title: '',
      size: 0,
      data: []
    };
    
    // Determina o tamanho do LUT a partir da primeira linha não comentada
    let sizeFound = false;
    
    for (const line of lines) {
      // Remove comentários e espaços em branco
      const trimmedLine = line.split('#')[0].trim();
      if (!trimmedLine) continue;
      
      // Verifica se é uma linha de metadados ou de dados
      if (!sizeFound && !isNaN(parseInt(trimmedLine))) {
        lutData.size = parseInt(trimmedLine);
        sizeFound = true;
      } else if (sizeFound) {
        // Lê os valores RGB
        const values = trimmedLine.split(/\s+/).map(parseFloat);
        if (values.length >= 3) {
          // Normaliza os valores para o intervalo [0, 1]
          const normalizedValues = values.slice(0, 3).map(v => v / 1023);
          lutData.data.push(normalizedValues);
        }
      }
    }
    
    return lutData;
  } catch (error) {
    console.error('Erro ao analisar arquivo LUT:', error);
    throw new Error('Formato de arquivo LUT inválido');
  }
}

// Converte dados de LUT para um formato simplificado
export function convertLUTToSimpleFormat(lutData) {
  // Esta é uma implementação simplificada que calcula fatores médios
  // Em uma implementação real, você usaria interpolação 3D
  
  // Calcula os fatores médios para cada canal
  let rSum = 0, gSum = 0, bSum = 0;
  let rOffset = 0, gOffset = 0, bOffset = 0;
  
  for (const [r, g, b] of lutData.data) {
    // Calcula o índice normalizado no intervalo [0, 1]
    const index = lutData.data.indexOf([r, g, b]) / lutData.data.length;
    
    // Acumula as diferenças
    rSum += r / index || 0;
    gSum += g / index || 0;
    bSum += b / index || 0;
    
    // Acumula os offsets
    rOffset += r - index;
    gOffset += g - index;
    bOffset += b - index;
  }
  
  // Calcula as médias
  const dataLength = lutData.data.length || 1;
  const rFactor = rSum / dataLength || 1;
  const gFactor = gSum / dataLength || 1;
  const bFactor = bSum / dataLength || 1;
  
  // Normaliza os offsets para o intervalo [-255, 255]
  const rOffsetNorm = Math.round((rOffset / dataLength) * 255);
  const gOffsetNorm = Math.round((gOffset / dataLength) * 255);
  const bOffsetNorm = Math.round((bOffset / dataLength) * 255);
  
  return {
    name: lutData.title || 'LUT sem título',
    r: { offset: rOffsetNorm, factor: rFactor },
    g: { offset: gOffsetNorm, factor: gFactor },
    b: { offset: bOffsetNorm, factor: bFactor }
  };
}

// Gera uma miniatura para um LUT
export function generateLUTThumbnail(lutData) {
  // Cria um canvas para a miniatura
  const canvas = document.createElement('canvas');
  const size = 100;
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  
  // Cria um gradiente para visualizar o efeito do LUT
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, 'black');
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
  
  // Retorna a URL da miniatura
  return canvas.toDataURL('image/png');
}
