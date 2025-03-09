/**
 * Componente para o painel de LUTs
 */
export function createLutPanel(options = {}) {
  const {
    luts = [],
    onLutSelect = () => {}
  } = options;
  
  // Cria o container do painel
  const container = document.createElement('div');
  container.className = 'lut-panel';
  
  // Cria o título
  const title = document.createElement('h3');
  title.className = 'sidebar-section-title';
  title.textContent = 'LUTs';
  container.appendChild(title);
  
  // Cria a descrição
  const description = document.createElement('p');
  description.className = 'sidebar-section-description';
  description.textContent = 'Selecione um LUT para aplicar à sua imagem:';
  container.appendChild(description);
  
  // Cria a grade de LUTs
  const grid = document.createElement('div');
  grid.className = 'lut-grid';
  
  // Adiciona cada LUT à grade
  luts.forEach(lut => {
    const lutItem = document.createElement('div');
    lutItem.className = 'lut-item';
    lutItem.dataset.lutId = lut.id;
    
    lutItem.innerHTML = `
      <img src="${lut.thumbnail || 'placeholder.jpg'}" alt="${lut.name}" class="lut-thumbnail">
      <div class="lut-name">${lut.name}</div>
    `;
    
    // Adiciona event listener para selecionar o LUT
    lutItem.addEventListener('click', () => {
      // Remove a classe 'active' de todos os itens
      grid.querySelectorAll('.lut-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Adiciona a classe 'active' ao item clicado
      lutItem.classList.add('active');
      
      // Chama o callback
      onLutSelect(lut);
    });
    
    grid.appendChild(lutItem);
  });
  
  container.appendChild(grid);
  
  return {
    element: container,
    
    // Atualiza os LUTs
    updateLuts: (newLuts) => {
      // Limpa a grade
      grid.innerHTML = '';
      
      // Adiciona os novos LUTs
      newLuts.forEach(lut => {
        const lutItem = document.createElement('div');
        lutItem.className = 'lut-item';
        lutItem.dataset.lutId = lut.id;
        
        lutItem.innerHTML = `
          <img src="${lut.thumbnail || 'placeholder.jpg'}" alt="${lut.name}" class="lut-thumbnail">
          <div class="lut-name">${lut.name}</div>
        `;
        
        // Adiciona event listener para selecionar o LUT
        lutItem.addEventListener('click', () => {
          // Remove a classe 'active' de todos os itens
          grid.querySelectorAll('.lut-item').forEach(item => {
            item.classList.remove('active');
          });
          
          // Adiciona a classe 'active' ao item clicado
          lutItem.classList.add('active');
          
          // Chama o callback
          onLutSelect(lut);
        });
        
        grid.appendChild(lutItem);
      });
    },
    
    // Seleciona um LUT pelo ID
    selectLut: (lutId) => {
      // Remove a classe 'active' de todos os itens
      grid.querySelectorAll('.lut-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Adiciona a classe 'active' ao item com o ID especificado
      const lutItem = grid.querySelector(`[data-lut-id="${lutId}"]`);
      if (lutItem) {
        lutItem.classList.add('active');
        lutItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };
}
