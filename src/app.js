/**
 * Aplicação principal do editor de fotos
 */
import { getLUTs } from './modules/storage.js';
import { processImage } from './modules/imageProcessor.js';

// Estado da aplicação
const state = {
  originalImage: null,
  processedImage: null,
  selectedLUT: null,
  adjustments: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    vibrance: 0
  }
};

// Cria a interface básica da aplicação
export function createBasicUI() {
  const appElement = document.getElementById('app');
  if (!appElement) {
    throw new Error('Elemento #app não encontrado');
  }
  
  // Limpa o conteúdo atual
  appElement.innerHTML = '';
  
  // Cria a estrutura básica da interface
  appElement.innerHTML = `
    <div class="app-header">
      <div class="app-title">Editor de Fotos com LUTs</div>
      <div class="app-actions">
        <button id="open-image-btn" class="action-button">
          <i class="fas fa-folder-open"></i> Abrir Imagem
        </button>
      </div>
    </div>
    
    <div class="editor-workspace">
      <div class="canvas-container" id="canvas-container">
        <div class="upload-container" id="upload-container">
          <div class="upload-area" id="upload-area">
            <div class="upload-icon">
              <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <div class="upload-text">Arraste e solte uma imagem aqui</div>
            <div class="upload-subtext">ou clique para selecionar um arquivo</div>
          </div>
          <input type="file" id="image-upload" accept="image/*" style="display: none;">
        </div>
      </div>
      
      <div class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">LUTs</h3>
          <button class="sidebar-close" id="sidebar-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="sidebar-content" id="sidebar-content">
          <!-- O conteúdo será carregado dinamicamente -->
        </div>
      </div>
    </div>
    
    <div class="toolbar" id="toolbar">
      <div class="toolbar-group">
        <button class="tool-button active" data-tool="lut">
          <i class="fas fa-palette"></i>
          <span class="tool-label">LUTs</span>
        </button>
        <button class="tool-button" data-tool="adjust">
          <i class="fas fa-sliders-h"></i>
          <span class="tool-label">Ajustes</span>
        </button>
      </div>
      <div class="toolbar-group">
        <button class="tool-button" data-tool="compare">
          <i class="fas fa-columns"></i>
          <span class="tool-label">Comparar</span>
        </button>
      </div>
      <div class="toolbar-group">
        <button class="tool-button" data-tool="save">
          <i class="fas fa-save"></i>
          <span class="tool-label">Salvar</span>
        </button>
        <button class="tool-button" data-tool="download">
          <i class="fas fa-download"></i>
          <span class="tool-label">Baixar</span>
        </button>
        <button class="tool-button" data-tool="reset">
          <i class="fas fa-undo"></i>
          <span class="tool-label">Resetar</span>
        </button>
      </div>
    </div>
    
    <div id="notification" class="notification" style="display: none;"></div>
  `;
  
  // Adiciona os event listeners
  setupEventListeners();
  
  // Carrega os LUTs e cria o painel
  loadLUTsPanel();
}

// Configura os event listeners
function setupEventListeners() {
  // Event listener para o botão de abrir imagem
  const openImageBtn = document.getElementById('open-image-btn');
  const imageUpload = document.getElementById('image-upload');
  
  if (openImageBtn && imageUpload) {
    openImageBtn.addEventListener('click', () => {
      imageUpload.click();
    });
  }
  
  // Event listener para o upload de imagem
  if (imageUpload) {
    imageUpload.addEventListener('change', handleImageUpload);
  }
  
  // Event listener para a área de upload (drag and drop)
  const uploadArea = document.getElementById('upload-area');
  if (uploadArea) {
    uploadArea.addEventListener('click', () => {
      if (imageUpload) imageUpload.click();
    });
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drop-zone-active');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drop-zone-active');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drop-zone-active');
      
      if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          handleImageFile(file);
        } else {
          showNotification('Apenas arquivos de imagem são aceitos', 'error');
        }
      }
    });
  }
  
  // Event listener para o botão de fechar o sidebar
  const sidebarCloseBtn = document.getElementById('sidebar-close');
  const sidebar = document.getElementById('sidebar');
  
  if (sidebarCloseBtn && sidebar) {
    sidebarCloseBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  }
  
  // Event listeners para os botões da barra de ferramentas
  const toolButtons = document.querySelectorAll('.tool-button');
  
  toolButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove a classe 'active' de todos os botões
      toolButtons.forEach(btn => btn.classList.remove('active'));
      
      // Adiciona a classe 'active' ao botão clicado
      button.classList.add('active');
      
      // Executa a ação correspondente à ferramenta
      const tool = button.dataset.tool;
      handleToolAction(tool);
    });
  });
}

// Manipula o upload de imagem
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Verifica se é uma imagem
  if (!file.type.startsWith('image/')) {
    showNotification('Apenas arquivos de imagem são aceitos', 'error');
    return;
  }
  
  handleImageFile(file);
}

// Processa o arquivo de imagem
function handleImageFile(file) {
  // Lê o arquivo como Data URL
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const imageData = e.target.result;
    
    // Atualiza o estado
    state.originalImage = imageData;
    state.processedImage = imageData;
    
    // Exibe a imagem no canvas
    displayImage(imageData);
    
    // Mostra notificação
    showNotification('Imagem carregada com sucesso', 'success');
    
    // Abre o painel de LUTs
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.add('open');
    }
  };
  
  reader.onerror = () => {
    showNotification('Erro ao ler o arquivo de imagem', 'error');
  };
  
  reader.readAsDataURL(file);
}

// Exibe a imagem no canvas
function displayImage(imageData) {
  const canvasContainer = document.getElementById('canvas-container');
  const uploadContainer = document.getElementById('upload-container');
  
  if (!canvasContainer) return;
  
  // Remove o container de upload
  if (uploadContainer) {
    uploadContainer.style.display = 'none';
  }
  
  // Verifica se já existe uma imagem
  let imageElement = canvasContainer.querySelector('.image-canvas');
  
  if (!imageElement) {
    // Cria um novo elemento de imagem
    imageElement = document.createElement('img');
    imageElement.className = 'image-canvas';
    canvasContainer.appendChild(imageElement);
  }
  
  // Define a imagem
  imageElement.src = imageData;
}

// Manipula as ações das ferramentas
function handleToolAction(tool) {
  switch (tool) {
    case 'lut':
      showLUTsPanel();
      break;
    case 'adjust':
      showAdjustmentsPanel();
      break;
    case 'compare':
      showComparisonView();
      break;
    case 'save':
      saveImage();
      break;
    case 'download':
      downloadImage();
      break;
    case 'reset':
      resetImage();
      break;
  }
}

// Mostra o painel de LUTs
function showLUTsPanel() {
  const sidebar = document.getElementById('sidebar');
  const sidebarTitle = document.querySelector('.sidebar-title');
  const sidebarContent = document.getElementById('sidebar-content');
  
  if (!sidebar || !sidebarTitle || !sidebarContent) return;
  
  // Atualiza o título
  sidebarTitle.textContent = 'LUTs';
  
  // Carrega os LUTs
  loadLUTsPanel();
  
  // Abre o painel
  sidebar.classList.add('open');
}

// Carrega os LUTs no painel
function loadLUTsPanel() {
  const sidebarContent = document.getElementById('sidebar-content');
  if (!sidebarContent) return;
  
  // Obtém os LUTs
  const luts = getLUTs();
  
  // Cria o HTML para o painel de LUTs
  let html = '<div class="lut-grid">';
  
  luts.forEach(lut => {
    html += `
      <div class="lut-item" data-lut-id="${lut.id}">
        <img src="${lut.thumbnail}" alt="${lut.name}" class="lut-thumbnail">
        <div class="lut-name">${lut.name}</div>
      </div>
    `;
  });
  
  html += '</div>';
  
  // Define o conteúdo do painel
  sidebarContent.innerHTML = html;
  
  // Adiciona event listeners para os LUTs
  const lutItems = sidebarContent.querySelectorAll('.lut-item');
  
  lutItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove a classe 'active' de todos os itens
      lutItems.forEach(i => i.classList.remove('active'));
      
      // Adiciona a classe 'active' ao item clicado
      item.classList.add('active');
      
      // Obtém o ID do LUT
      const lutId = item.dataset.lutId;
      
      // Encontra o LUT correspondente
      const lut = luts.find(l => l.id === lutId);
      
      if (lut) {
        // Aplica o LUT à imagem
        applyLUTToImage(lut);
      }
    });
  });
}

// Aplica um LUT à imagem
async function applyLUTToImage(lut) {
  if (!state.originalImage) {
    showNotification('Carregue uma imagem primeiro', 'error');
    return;
  }
  
  try {
    // Mostra notificação de processamento
    showNotification(`Aplicando LUT "${lut.name}"...`, 'info');
    
    // Processa a imagem
    const processedImage = await processImage(state.originalImage, {
      lut,
      adjustments: state.adjustments
    });
    
    // Atualiza o estado
    state.selectedLUT = lut;
    state.processedImage = processedImage;
    
    // Exibe a imagem processada
    displayImage(processedImage);
    
    // Mostra notificação de sucesso
    showNotification(`LUT "${lut.name}" aplicado com sucesso`, 'success');
  } catch (error) {
    console.error('Erro ao aplicar LUT:', error);
    showNotification('Erro ao aplicar LUT', 'error');
  }
}

// Mostra o painel de ajustes
function showAdjustmentsPanel() {
  const sidebar = document.getElementById('sidebar');
  const sidebarTitle = document.querySelector('.sidebar-title');
  const sidebarContent = document.getElementById('sidebar-content');
  
  if (!sidebar || !sidebarTitle || !sidebarContent) return;
  
  // Atualiza o título
  sidebarTitle.textContent = 'Ajustes';
  
  // Cria o HTML para o painel de ajustes
  const html = `
    <div class="adjustments-panel">
      <div class="adjustment-panel">
        <div class="adjustment-header">
          <span class="adjustment-title">Brilho</span>
          <span class="adjustment-value">0</span>
        </div>
        <div class="slider-container">
          <input type="range" class="slider" id="brightness-slider" min="-100" max="100" value="0" step="1">
        </div>
      </div>
      
      <div class="adjustment-panel">
        <div class="adjustment-header">
          <span class="adjustment-title">Contraste</span>
          <span class="adjustment-value">0</span>
        </div>
        <div class="slider-container">
          <input type="range" class="slider" id="contrast-slider" min="-100" max="100" value="0" step="1">
        </div>
      </div>
      
      <div class="adjustment-panel">
        <div class="adjustment-header">
          <span class="adjustment-title">Saturação</span>
          <span class="adjustment-value">0</span>
        </div>
        <div class="slider-container">
          <input type="range" class="slider" id="saturation-slider" min="-100" max="100" value="0" step="1">
        </div>
      </div>
      
      <div class="adjustment-panel">
        <div class="adjustment-header">
          <span class="adjustment-title">Temperatura</span>
          <span class="adjustment-value">0</span>
        </div>
        <div class="slider-container">
          <input type="range" class="slider" id="temperature-slider" min="-100" max="100" value="0" step="1">
        </div>
      </div>
      
      <button class="action-button secondary" id="reset-adjustments" style="width: 100%; margin-top: 20px;">
        Resetar Ajustes
      </button>
    </div>
  `;
  
  // Define o conteúdo do painel
  sidebarContent.innerHTML = html;
  
  // Adiciona event listeners para os sliders
  const sliders = {
    brightness: document.getElementById('brightness-slider'),
    contrast: document.getElementById('contrast-slider'),
    saturation: document.getElementById('saturation-slider'),
    temperature: document.getElementById('temperature-slider')
  };
  
  // Configura os sliders com os valores atuais
  Object.entries(sliders).forEach(([key, slider]) => {
    if (slider) {
      slider.value = state.adjustments[key] || 0;
      
      // Atualiza o valor exibido
      const valueElement = slider.parentElement.parentElement.querySelector('.adjustment-value');
      if (valueElement) {
        valueElement.textContent = slider.value;
      }
      
      // Adiciona event listener
      slider.addEventListener('input', (e) => {
        // Atualiza o valor exibido
        if (valueElement) {
          valueElement.textContent = e.target.value;
        }
        
        // Atualiza o estado
        state.adjustments[key] = parseInt(e.target.value);
        
        // Aplica os ajustes (com debounce)
        debounceAdjustments();
      });
    }
  });
  
  // Event listener para o botão de resetar ajustes
  const resetButton = document.getElementById('reset-adjustments');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      // Reseta os ajustes
      state.adjustments = {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        tint: 0,
        vibrance: 0
      };
      
      // Atualiza os sliders
      Object.entries(sliders).forEach(([key, slider]) => {
        if (slider) {
          slider.value = 0;
          
          // Atualiza o valor exibido
          const valueElement = slider.parentElement.parentElement.querySelector('.adjustment-value');
          if (valueElement) {
            valueElement.textContent = '0';
          }
        }
      });
      
      // Aplica os ajustes
      applyAdjustments();
    });
  }
  
  // Abre o painel
  sidebar.classList.add('open');
}

// Variável para armazenar o timeout de debounce
let adjustmentsTimeout;

// Aplica os ajustes com debounce
function debounceAdjustments() {
  if (adjustmentsTimeout) {
    clearTimeout(adjustmentsTimeout);
  }
  
  adjustmentsTimeout = setTimeout(() => {
    applyAdjustments();
  }, 300);
}

// Aplica os ajustes à imagem
async function applyAdjustments() {
  if (!state.originalImage) {
    showNotification('Carregue uma imagem primeiro', 'error');
    return;
  }
  
  try {
    // Processa a imagem
    const processedImage = await processImage(state.originalImage, {
      lut: state.selectedLUT,
      adjustments: state.adjustments
    });
    
    // Atualiza o estado
    state.processedImage = processedImage;
    
    // Exibe a imagem processada
    displayImage(processedImage);
  } catch (error) {
    console.error('Erro ao aplicar ajustes:', error);
    showNotification('Erro ao aplicar ajustes', 'error');
  }
}

// Mostra a visualização de comparação
function showComparisonView() {
  if (!state.originalImage || !state.processedImage) {
    showNotification('Carregue e edite uma imagem primeiro', 'error');
    return;
  }
  
  const canvasContainer = document.getElementById('canvas-container');
  if (!canvasContainer) return;
  
  // Cria a visualização de comparação
  canvasContainer.innerHTML = `
    <div class="comparison-view" style="--position: 50%;">
      <img class="before" src="${state.originalImage}" alt="Antes">
      <img class="after" src="${state.processedImage}" alt="Depois">
      <div class="comparison-divider"></div>
      <div class="comparison-handle"></div>
    </div>
    <button class="action-button" id="exit-comparison" style="position: absolute; top: 20px; right: 20px; z-index: 100;">
      <i class="fas fa-times"></i> Sair da comparação
    </button>
  `;
  
  // Configura o slider de comparação
  setupComparisonSlider();
  
  // Adiciona event listener para o botão de sair
  const exitButton = document.getElementById('exit-comparison');
  if (exitButton) {
    exitButton.addEventListener('click', () => {
      // Restaura a visualização normal
      displayImage(state.processedImage);
    });
  }
  
  // Mostra notificação
  showNotification('Arraste o divisor para comparar antes e depois', 'info');
}

// Configura o slider de comparação
function setupComparisonSlider() {
  const comparisonView = document.querySelector('.comparison-view');
  const handle = document.querySelector('.comparison-handle');
  
  if (!comparisonView || !handle) return;
  
  let isDragging = false;
  
  // Event listeners para mouse
  handle.addEventListener('mousedown', () => {
    isDragging = true;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const rect = comparisonView.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const position = (x / rect.width) * 100;
    
    comparisonView.style.setProperty('--position', `${position}%`);
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  // Event listeners para touch
  handle.addEventListener('touchstart', () => {
    isDragging = true;
  });
  
  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const rect = comparisonView.getBoundingClientRect();
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const position = (x / rect.width) * 100;
    
    comparisonView.style.setProperty('--position', `${position}%`);
  });
  
  document.addEventListener('touchend', () => {
    isDragging = false;
  });
}

// Salva a imagem
function saveImage() {
  if (!state.processedImage) {
    showNotification('Edite uma imagem primeiro', 'error');
    return;
  }
  
  // Aqui você pode implementar a lógica para salvar a imagem
  // Por exemplo, enviando para um servidor ou salvando localmente
  
  showNotification('Imagem salva com sucesso', 'success');
}

// Baixa a imagem
function downloadImage() {
  if (!state.processedImage) {
    showNotification('Edite uma imagem primeiro', 'error');
    return;
  }
  
  // Cria um link para download
  const link = document.createElement('a');
  link.href = state.processedImage;
  link.download = `edited_image_${Date.now()}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Download iniciado', 'success');
}

// Reseta a imagem
function resetImage() {
  if (!state.originalImage) {
    showNotification('Carregue uma imagem primeiro', 'error');
    return;
  }
  
  // Reseta o estado
  state.selectedLUT = null;
  state.adjustments = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    vibrance: 0
  };
  state.processedImage = state.originalImage;
  
  // Exibe a imagem original
  displayImage(state.originalImage);
  
  // Mostra notificação
  showNotification('Imagem resetada', 'success');
}

// Exibe uma notificação
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  if (!notification) return;
  
  // Define o ícone com base no tipo
  let icon = 'fas fa-info-circle';
  let title = 'Informação';
  
  if (type === 'success') {
    icon = 'fas fa-check-circle';
    title = 'Sucesso';
  } else if (type === 'error') {
    icon = 'fas fa-exclamation-circle';
    title = 'Erro';
  }
  
  // Define o conteúdo da notificação
  notification.innerHTML = `
    <div class="notification-icon">
      <i class="${icon}"></i>
    </div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
  `;
  
  // Adiciona a classe de tipo
  notification.className = `notification notification-${type}`;
  
  // Exibe a notificação
  notification.style.display = 'flex';
  
  // Remove a notificação após 3 segundos
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}
