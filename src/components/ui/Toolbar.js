/**
 * Componente da barra de ferramentas principal
 */
export function createToolbar(options = {}) {
  const {
    tools = [],
    onToolSelect = () => {}
  } = options;
  
  // Cria o elemento da barra de ferramentas
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';
  
  // Agrupa as ferramentas por categoria
  const toolGroups = groupToolsByCategory(tools);
  
  // Adiciona os grupos de ferramentas
  Object.entries(toolGroups).forEach(([category, categoryTools]) => {
    const group = document.createElement('div');
    group.className = 'toolbar-group';
    
    // Adiciona cada ferramenta ao grupo
    categoryTools.forEach(tool => {
      const button = createToolButton(tool);
      
      // Adiciona event listener para selecionar a ferramenta
      button.addEventListener('click', () => {
        // Remove a classe 'active' de todos os botões
        toolbar.querySelectorAll('.tool-button').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Adiciona a classe 'active' ao botão clicado
        button.classList.add('active');
        
        // Chama o callback
        onToolSelect(tool);
      });
      
      group.appendChild(button);
    });
    
    toolbar.appendChild(group);
  });
  
  return {
    element: toolbar
  };
}

/**
 * Cria um botão de ferramenta
 */
function createToolButton(tool) {
  const button = document.createElement('button');
  button.className = 'tool-button';
  button.dataset.tool = tool.id;
  
  if (tool.active) {
    button.classList.add('active');
  }
  
  // Adiciona o ícone
  const icon = document.createElement('i');
  icon.className = tool.icon;
  button.appendChild(icon);
  
  // Adiciona o label
  const label = document.createElement('span');
  label.className = 'tool-label';
  label.textContent = tool.label;
  button.appendChild(label);
  
  return button;
}

/**
 * Agrupa as ferramentas por categoria
 */
function groupToolsByCategory(tools) {
  return tools.reduce((groups, tool) => {
    const category = tool.category || 'default';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(tool);
    return groups;
  }, {});
}
