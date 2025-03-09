/**
 * Componente da área de canvas para edição de imagem
 */
export function createCanvas(options = {}) {
  const {
    onZoomChange = () => {},
    onPanChange = () => {},
    onImageLoad = () => {}
  } = options;
  
  // Estado do canvas
  let state = {
    zoom: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    image: null
  };
  
  // Cria o elemento do container
  const container = document.createElement('div');
  container.className = 'canvas-container';
  
  // Cria a área do canvas
  const canvasArea = document.createElement('div');
  canvasArea.className = 'canvas-area';
  container.appendChild(canvasArea);
  
  // Cria o elemento de imagem
  const imageElement = document.createElement('img');
  imageElement.className = 'image-canvas';
  imageElement.style.transform = `scale(${state.zoom}) translate(${state.panX}px, ${state.panY}px)`;
  canvasArea.appendChild(imageElement);
  
  // Cria os controles de zoom
  const zoomControls = document.createElement('div');
  zoomControls.className = 'zoom-controls';
  zoomControls.innerHTML = `
    <button class="zoom-button zoom-out"><i class="fas fa-minus"></i></button>
    <span class="zoom-level">100%</span>
    <button class="zoom-button zoom-in"><i class="fas fa-plus"></i></button>
  `;
  container.appendChild(zoomControls);
  
  // Adiciona event listeners para zoom
  const zoomInButton = zoomControls.querySelector('.zoom-in');
  const zoomOutButton = zoomControls.querySelector('.zoom-out');
  const zoomLevelElement = zoomControls.querySelector('.zoom-level');
  
  zoomInButton.addEventListener('click', () => {
    zoomIn();
  });
  
  zoomOutButton.addEventListener('click', () => {
    zoomOut();
  });
  
  // Adiciona event listeners para pan
  canvasArea.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Botão esquerdo do mouse
      state.isDragging = true;
      state.startX = e.clientX - state.panX;
      state.startY = e.clientY - state.panY;
      canvasArea.style.cursor = 'grabbing';
    }
  });
  
  window.addEventListener('mousemove', (e) => {
    if (state.isDragging) {
      state.panX = e.clientX - state.startX;
      state.panY = e.clientY - state.startY;
      updateTransform();
      onPanChange(state.panX, state.panY);
    }
  });
  
  window.addEventListener('mouseup', () => {
    if (state.isDragging) {
      state.isDragging = false;
      canvasArea.style.cursor = 'grab';
    }
  });
  
  // Adiciona event listener para zoom com roda do mouse
  canvasArea.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  });
  
  // Funções para manipular o zoom
  function zoomIn() {
    state.zoom = Math.min(state.zoom + 0.1, 3);
    updateTransform();
    updateZoomLevel();
    onZoomChange(state.zoom);
  }
  
  function zoomOut() {
    state.zoom = Math.max(state.zoom - 0.1, 0.5);
    updateTransform();
    updateZoomLevel();
    onZoomChange(state.zoom);
  }
  
  function updateTransform() {
    imageElement.style.transform = `scale(${state.zoom}) translate(${state.panX / state.zoom}px, ${state.panY / state.zoom}px)`;
  }
  
  function updateZoomLevel() {
    zoomLevelElement.textContent = `${Math.round(state.zoom * 100)}%`;
  }
  
  // Métodos públicos
  const canvas = {
    element: container,
    
    // Carrega uma imagem no canvas
    loadImage: (src) => {
      return new Promise((resolve, reject) => {
        // Reseta o estado
        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;
        
        // Carrega a imagem
        imageElement.onload = () => {
          state.image = {
            src,
            width: imageElement.naturalWidth,
            height: imageElement.naturalHeight
          };
          
          updateTransform();
          updateZoomLevel();
          onImageLoad(state.image);
          resolve(state.image);
        };
        
        imageElement.onerror = (error) => {
          reject(error);
        };
        
        imageElement.src = src;
      });
    },
    
    // Aplica um filtro à imagem
    applyFilter: (filterFunction) => {
      if (!state.image) return null;
      
      // Cria um canvas temporário para aplicar o filtro
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      // Carrega a imagem em um novo elemento para não afetar o original
      const tempImg = new Image();
      
      return new Promise((resolve, reject) => {
        tempImg.onload = () => {
          // Define o tamanho do canvas
          tempCanvas.width = tempImg.naturalWidth;
          tempCanvas.height = tempImg.naturalHeight;
          
          // Desenha a imagem no canvas
          ctx.drawImage(tempImg, 0, 0);
          
          // Obtém os dados da imagem
          const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          
          // Aplica o filtro
          const filteredData = filterFunction(imageData);
          
          // Coloca os dados filtrados de volta no canvas
          ctx.putImageData(filteredData, 0, 0);
          
          // Converte o canvas para uma URL de dados
          const filteredImageUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
          
          // Atualiza a imagem no canvas
          imageElement.src = filteredImageUrl;
          
          // Atualiza o estado
          state.image.src = filteredImageUrl;
          
          resolve(filteredImageUrl);
        };
        
        tempImg.onerror = (error) => {
          reject(error);
        };
        
        tempImg.src = state.image.src;
      });
    },
    
    // Obtém a imagem atual
    getImage: () => {
      return state.image;
    },
    
    // Reseta o zoom e pan
    resetView: () => {
      state.zoom = 1;
      state.panX = 0;
      state.panY = 0;
      updateTransform();
      updateZoomLevel();
      onZoomChange(state.zoom);
      onPanChange(state.panX, state.panY);
    },
    
    // Define o zoom
    setZoom: (zoom) => {
      state.zoom = Math.max(0.5, Math.min(zoom, 3));
      updateTransform();
      updateZoomLevel();
      onZoomChange(state.zoom);
    },
    
    // Cria uma visualização de comparação antes/depois
    createComparisonView: (originalSrc, processedSrc) => {
      // Remove a imagem atual
      canvasArea.innerHTML = '';
      
      // Cria o container de comparação
      const comparisonView = document.createElement('div');
      comparisonView.className = 'comparison-view';
      comparisonView.style.setProperty('--position', '50%');
      
      // Cria as imagens antes e depois
      const beforeImg = document.createElement('img');
      beforeImg.className = 'before';
      beforeImg.src = originalSrc;
      
      const afterImg = document.createElement('img');
      afterImg.className = 'after';
      afterImg.src = processedSrc;
      
      // Cria o divisor e o manipulador
      const divider = document.createElement('div');
      divider.className = 'comparison-divider';
      
      const handle = document.createElement('div');
      handle.className = 'comparison-handle';
      
      // Adiciona os elementos ao DOM
      comparisonView.appendChild(beforeImg);
      comparisonView.appendChild(afterImg);
      comparisonView.appendChild(divider);
      comparisonView.appendChild(handle);
      
      canvasArea.appendChild(comparisonView);
      
      // Adiciona event listeners para arrastar o divisor
      let isDragging = false;
      
      handle.addEventListener('mousedown', () => {
        isDragging = true;
      });
      
      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const rect = comparisonView.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const position = (x / rect.width) * 100;
        
        comparisonView.style.setProperty('--position', `${position}%`);
      });
      
      window.addEventListener('mouseup', () => {
        isDragging = false;
      });
      
      // Suporte para touch em dispositivos móveis
      handle.addEventListener('touchstart', () => {
        isDragging = true;
      });
      
      window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const touch = e.touches[0];
        const rect = comparisonView.getBoundingClientRect();
        const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
        const position = (x / rect.width) * 100;
        
        comparisonView.style.setProperty('--position', `${position}%`);
      });
      
      window.addEventListener('touchend', () => {
        isDragging = false;
      });
      
      return comparisonView;
    },
    
    // Restaura a visualização normal
    restoreNormalView: () => {
      canvasArea.innerHTML = '';
      canvasArea.appendChild(imageElement);
    }
  };
  
  return canvas;
}
