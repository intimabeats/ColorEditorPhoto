// Componente para prévia de LUT

// Cria um componente de prévia de LUT
export function createLUTPreview(lutData, options = {}) {
  const {
    size = 150,
    onClick,
    selected = false
  } = options;
  
  // Cria o elemento da prévia
  const preview = document.createElement('div');
  preview.className = 'lut-preview';
  if (selected) {
    preview.classList.add('lut-preview-selected');
  }
  
  // Cria o canvas para a prévia
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  
  // Renderiza a prévia
  renderLUTPreview(canvas, lutData);
  
  // Adiciona o canvas à prévia
  preview.appendChild(canvas);
  
  // Adiciona o nome do LUT
  const nameElement = document.createElement('div');
  nameElement.className = 'lut-preview-name';
  nameElement.textContent = lutData.name;
  preview.appendChild(nameElement);
  
  // Adiciona event listener para clique
  if (onClick) {
    preview.addEventListener('click', () => {
      onClick(lutData);
    });
  }
  
  return preview;
}

// Renderiza a prévia do LUT em um canvas
function renderLUTPreview(canvas, lutData) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  
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
}

// Adiciona estilos CSS para a prévia
export function addPreviewStyles() {
  // Verifica se os estilos já foram adicionados
  if (document.getElementById('lut-preview-styles')) {
    return;
  }
  
  // Cria o elemento de estilo
  const style = document.createElement('style');
  style.id = 'lut-preview-styles';
  
  // Define os estilos
  style.textContent = `
    .lut-preview {
      display: inline-block;
      margin: 0.5rem;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
    }
    
    .lut-preview:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    
    .lut-preview-selected {
      border: 3px solid #3498db;
    }
    
    .lut-preview canvas {
      display: block;
    }
    
    .lut-preview-name {
      padding: 0.5rem;
      text-align: center;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      font-size: 0.9rem;
    }
  `;
  
  // Adiciona os estilos ao documento
  document.head.appendChild(style);
}
