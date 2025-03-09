/**
 * Componente para o painel de ajustes
 */
export function createAdjustmentsPanel(options = {}) {
  const {
    onAdjustmentChange = () => {}
  } = options;
  
  // Cria o container do painel
  const container = document.createElement('div');
  container.className = 'adjustments-panel';
  
  // Cria o título
  const title = document.createElement('h3');
  title.className = 'sidebar-section-title';
  title.textContent = 'Ajustes';
  container.appendChild(title);
  
  // Cria a descrição
  const description = document.createElement('p');
  description.className = 'sidebar-section-description';
  description.textContent = 'Ajuste os parâmetros da imagem:';
  container.appendChild(description);
  
  // Define os ajustes disponíveis
  const adjustments = [
    { id: 'brightness', name: 'Brilho', min: -100, max: 100, value: 0, step: 1 },
    { id: 'contrast', name: 'Contraste', min: -100, max: 100, value: 0, step: 1 },
    { id: 'saturation', name: 'Saturação', min: -100, max: 100, value: 0, step: 1 },
    { id: 'temperature', name: 'Temperatura', min: -100, max: 100, value: 0, step: 1 },
    { id: 'tint', name: 'Matiz', min: -100, max: 100, value: 0, step: 1 },
    { id: 'vibrance', name: 'Vibração', min: -100, max: 100, value: 0, step: 1 }
  ];
  
  // Cria os sliders para cada ajuste
  adjustments.forEach(adjustment => {
    const panel = createAdjustmentSlider(adjustment);
    container.appendChild(panel.element);
    
    // Adiciona event listener para mudanças no slider
    panel.onChange((value) => {
      onAdjustmentChange(adjustment.id, parseFloat(value));
    });
  });
  
  // Adiciona botão para resetar ajustes
  const resetButton = document.createElement('button');
  resetButton.className = 'action-button secondary';
  resetButton.style.marginTop = '16px';
  resetButton.style.width = '100%';
  resetButton.textContent = 'Resetar Ajustes';
  resetButton.addEventListener('click', () => {
    // Reseta todos os sliders para o valor padrão
    adjustments.forEach(adjustment => {
      const slider = container.querySelector(`#adjustment-${adjustment.id}`);
      if (slider) {
        slider.value = adjustment.value;
        slider.dispatchEvent(new Event('input'));
      }
    });
  });
  
  container.appendChild(resetButton);
  
  return {
    element: container,
    
    // Obtém o valor de um ajuste
    getValue: (id) => {
      const slider = container.querySelector(`#adjustment-${id}`);
      return slider ? parseFloat(slider.value) : 0;
    },
    
    // Define o valor de um ajuste
    setValue: (id, value) => {
      const slider = container.querySelector(`#adjustment-${id}`);
      if (slider) {
        slider.value = value;
        slider.dispatchEvent(new Event('input'));
      }
    },
    
    // Reseta todos os ajustes
    resetAll: () => {
      adjustments.forEach(adjustment => {
        const slider = container.querySelector(`#adjustment-${adjustment.id}`);
        if (slider) {
          slider.value = adjustment.value;
          slider.dispatchEvent(new Event('input'));
        }
      });
    }
  };
}

/**
 * Cria um slider de ajuste
 */
function createAdjustmentSlider(adjustment) {
  const { id, name, min, max, value, step } = adjustment;
  
  // Cria o container do slider
  const container = document.createElement('div');
  container.className = 'adjustment-panel';
  
  // Cria o cabeçalho
  const header = document.createElement('div');
  header.className = 'adjustment-header';
  
  const nameElement = document.createElement('span');
  nameElement.className = 'adjustment-title';
  nameElement.textContent = name;
  header.appendChild(nameElement);
  
  const valueElement = document.createElement('span');
  valueElement.className = 'adjustment-value';
  valueElement.textContent = value;
  header.appendChild(valueElement);
  
  container.appendChild(header);
  
  // Cria o slider
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'slider-container';
  
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'slider';
  slider.id = `adjustment-${id}`;
  slider.min = min;
  slider.max = max;
  slider.value = value;
  slider.step = step;
  
  slider.addEventListener('input', () => {
    valueElement.textContent = slider.value;
    if (container.onChangeCallback) {
      container.onChangeCallback(slider.value);
    }
  });
  
  sliderContainer.appendChild(slider);
  container.appendChild(sliderContainer);
  
  return {
    element: container,
    
    // Define o callback para mudanças no slider
    onChange: (callback) => {
      container.onChangeCallback = callback;
    }
  };
}
