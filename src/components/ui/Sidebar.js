/**
 * Componente do painel lateral
 */
export function createSidebar(options = {}) {
  const {
    title = 'Ajustes',
    content = null,
    onClose = () => {}
  } = options;
  
  // Cria o elemento do painel lateral
  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';
  
  // Cria o cabeçalho
  const header = document.createElement('div');
  header.className = 'sidebar-header';
  
  const titleElement = document.createElement('h3');
  titleElement.className = 'sidebar-title';
  titleElement.textContent = title;
  header.appendChild(titleElement);
  
  const closeButton = document.createElement('button');
  closeButton.className = 'sidebar-close';
  closeButton.innerHTML = '<i class="fas fa-times"></i>';
  closeButton.addEventListener('click', onClose);
  header.appendChild(closeButton);
  
  sidebar.appendChild(header);
  
  // Cria o conteúdo
  const contentElement = document.createElement('div');
  contentElement.className = 'sidebar-content';
  
  if (content) {
    if (typeof content === 'string') {
      contentElement.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      contentElement.appendChild(content);
    }
  }
  
  sidebar.appendChild(contentElement);
  
  // Métodos para controlar o painel
  const sidebarObj = {
    element: sidebar,
    
    open: () => {
      sidebar.classList.add('open');
    },
    
    close: () => {
      sidebar.classList.remove('open');
    },
    
    toggle: () => {
      sidebar.classList.toggle('open');
    },
    
    setContent: (newContent) => {
      contentElement.innerHTML = '';
      
      if (typeof newContent === 'string') {
        contentElement.innerHTML = newContent;
      } else if (newContent instanceof HTMLElement) {
        contentElement.appendChild(newContent);
      }
    },
    
    setTitle: (newTitle) => {
      titleElement.textContent = newTitle;
    }
  };
  
  return sidebarObj;
}

/**
 * Cria um painel de ajuste com slider
 */
export function createAdjustmentPanel(options = {}) {
  const {
    title = 'Ajuste',
    min = 0,
    max = 100,
    value = 50,
    step = 1,
    onChange = () => {}
  } = options;
  
  // Cria o elemento do painel
  const panel = document.createElement('div');
  panel.className = 'adjustment-panel';
  
  // Cria o cabeçalho
  const header = document.createElement('div');
  header.className = 'adjustment-header';
  
  const titleElement = document.createElement('span');
  titleElement.className = 'adjustment-title';
  titleElement.textContent = title;
  header.appendChild(titleElement);
  
  const valueElement = document.createElement('span');
  valueElement.className = 'adjustment-value';
  valueElement.textContent = value;
  header.appendChild(valueElement);
  
  panel.appendChild(header);
  
  // Cria o slider
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'slider-container';
  
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'slider';
  slider.min = min;
  slider.max = max;
  slider.value = value;
  slider.step = step;
  
  slider.addEventListener('input', (e) => {
    const newValue = e.target.value;
    valueElement.textContent = newValue;
    onChange(newValue);
  });
  
  sliderContainer.appendChild(slider);
  panel.appendChild(sliderContainer);
  
  // Métodos para controlar o painel
  const panelObj = {
    element: panel,
    
    setValue: (newValue) => {
      slider.value = newValue;
      valueElement.textContent = newValue;
    },
    
    getValue: () => {
      return parseFloat(slider.value);
    }
  };
  
  return panelObj;
}
