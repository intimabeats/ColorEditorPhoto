
import { getLUTs, saveLUT, updateLUT, deleteLUT, getLUTById } from '../services/storage.js';
import { loadLUTFile } from '../services/imageProcessor.js';

// Renderiza a página de administração
export function renderAdmin() {
  const contentElement = document.getElementById('content');
  
  // Estrutura HTML do painel de administração
  contentElement.innerHTML = `
    <div class="page-header">
      <h2>Painel de Administração</h2>
      <p>Gerencie os LUTs disponíveis para edição de fotos.</p>
    </div>
    
    <div class="admin-container">
      <div class="card">
        <h3>Adicionar Novo LUT</h3>
        <form id="add-lut-form">
          <div class="form-group">
            <label for="lut-name">Nome do LUT</label>
            <input type="text" id="lut-name" class="form-control" required placeholder="Ex: Vintage, Preto e Branco, Sépia...">
          </div>
          
          <div class="form-group">
            <label for="lut-description">Descrição</label>
            <textarea id="lut-description" class="form-control" rows="3" placeholder="Descreva o efeito deste LUT..."></textarea>
          </div>
          
          <div class="form-group">
            <label for="lut-file">Arquivo LUT (opcional)</label>
            <div class="drop-zone" id="lut-drop-zone">
              <div class="drop-zone-icon">📁</div>
              <p>Arraste e solte um arquivo LUT aqui ou clique para selecionar</p>
              <small>Formatos suportados: .cube, .3dl</small>
              <input type="file" id="lut-file" class="form-control" accept=".cube,.3dl" style="display: none;">
            </div>
          </div>
          
          <div class="card" style="margin-top: 1.5rem; background-color: #f8f9fa;">
            <h4>Configuração Manual</h4>
            <p>Se não tiver um arquivo LUT, configure manualmente os parâmetros:</p>
            
            <div class="form-group">
              <label>Canal Vermelho (R)</label>
              <div style="display: flex; gap: 1rem;">
                <div style="flex: 1;">
                  <label for="r-offset">Offset</label>
                  <input type="number" id="r-offset" class="form-control" value="0" min="-255" max="255">
                  <small>Valores entre -255 e 255</small>
                </div>
                <div style="flex: 1;">
                  <label for="r-factor">Fator</label>
                  <input type="number" id="r-factor" class="form-control" value="1" min="0" max="2" step="0.1">
                  <small>Valores entre 0 e 2</small>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Canal Verde (G)</label>
              <div style="display: flex; gap: 1rem;">
                <div style="flex: 1;">
                  <label for="g-offset">Offset</label>
                  <input type="number" id="g-offset" class="form-control" value="0" min="-255" max="255">
                  <small>Valores entre -255 e 255</small>
                </div>
                <div style="flex: 1;">
                  <label for="g-factor">Fator</label>
                  <input type="number" id="g-factor" class="form-control" value="1" min="0" max="2" step="0.1">
                  <small>Valores entre 0 e 2</small>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Canal Azul (B)</label>
              <div style="display: flex; gap: 1rem;">
                <div style="flex: 1;">
                  <label for="b-offset">Offset</label>
                  <input type="number" id="b-offset" class="form-control" value="0" min="-255" max="255">
                  <small>Valores entre -255 e 255</small>
                </div>
                <div style="flex: 1;">
                  <label for="b-factor">Fator</label>
                  <input type="number" id="b-factor" class="form-control" value="1" min="0" max="2" step="0.1">
                  <small>Valores entre 0 e 2</small>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="lut-thumbnail">Miniatura (opcional)</label>
            <div class="drop-zone" id="thumbnail-drop-zone">
              <div class="drop-zone-icon">🖼️</div>
              <p>Arraste e solte uma imagem para usar como miniatura ou clique para selecionar</p>
              <input type="file" id="lut-thumbnail" class="form-control" accept="image/*" style="display: none;">
            </div>
          </div>
          
          <div class="form-group" style="margin-top: 1.5rem;">
            <button type="submit" class="btn btn-success">
              <i class="icon">➕</i> Adicionar LUT
            </button>
          </div>
        </form>
      </div>
      
      <div class="card">
        <h3>LUTs Existentes</h3>
        <div id="luts-list">
          <div class="loading-message">
            <div class="loader"></div>
            <p>Carregando LUTs...</p>
          </div>
        </div>
      </div>
    </div>
    
    <div id="notification" class="notification" style="display: none;"></div>
  `;
  
  // Adiciona os event listeners
  setupAdminEventListeners();
  
  // Carrega os LUTs existentes
  loadExistingLUTs();
}

// Configura os event listeners para o painel de administração
function setupAdminEventListeners() {
  // Event listener para o formulário de adição de LUT
  const addLUTForm = document.getElementById('add-lut-form');
  addLUTForm.addEventListener('submit', handleAddLUT);
  
  // Event listener para o arquivo LUT
  setupDropZone('lut-drop-zone', 'lut-file', handleLUTFileChange);
  
  // Event listener para a miniatura
  setupDropZone('thumbnail-drop-zone', 'lut-thumbnail');
}

// Configura uma zona de drop
function setupDropZone(dropZoneId, inputId, changeHandler = null) {
  const dropZone = document.getElementById(dropZoneId);
  const input = document.getElementById(inputId);
  
  if (!dropZone || !input) return;
  
  // Clique na zona de drop
  dropZone.addEventListener('click', () => {
    input.click();
  });
  
  // Drag over
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drop-zone-active');
  });
  
  // Drag leave
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drop-zone-active');
  });
  
  // Drop
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drop-zone-active');
    
    if (e.dataTransfer.files.length > 0) {
      input.files = e.dataTransfer.files;
      
      // Atualiza o visual da zona de drop
      updateDropZoneVisual(dropZone, e.dataTransfer.files[0]);
      
      // Chama o handler de mudança, se fornecido
      if (changeHandler) {
        changeHandler({ target: input });
      }
    }
  });
  
  // Change
  input.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      // Atualiza o visual da zona de drop
      updateDropZoneVisual(dropZone, e.target.files[0]);
      
      // Chama o handler de mudança, se fornecido
      if (changeHandler && changeHandler !== input.onchange) {
        changeHandler(e);
      }
    }
  });
}

// Atualiza o visual da zona de drop após selecionar um arquivo
function updateDropZoneVisual(dropZone, file) {
  // Limpa o conteúdo atual
  const originalHTML = dropZone.innerHTML;
  
  if (file.type.startsWith('image/')) {
    // Para arquivos de imagem, mostra uma prévia
    const reader = new FileReader();
    reader.onload = (e) => {
      dropZone.innerHTML = `
        <div style="text-align: center;">
          <img src="${e.target.result}" alt="Prévia" style="max-width: 100%; max-height: 150px; margin-bottom: 0.5rem;">
          <p>${file.name}</p>
          <button type="button" class="btn btn-sm btn-outline" id="clear-file">Remover</button>
        </div>
      `;
      
      // Adiciona event listener para o botão de remover
      const clearButton = dropZone.querySelector('#clear-file');
      clearButton.addEventListener('click', (e) => {
        e.stopPropagation();
        dropZone.innerHTML = originalHTML;
        
        // Limpa o input de arquivo
        const input = document.getElementById(dropZone.id.replace('-drop-zone', ''));
        if (input) {
          input.value = '';
        }
      });
    };
    reader.readAsDataURL(file);
  } else {
    // Para outros tipos de arquivo, mostra apenas o nome
    dropZone.innerHTML = `
      <div style="text-align: center;">
        <div class="drop-zone-icon">📄</div>
        <p>${file.name}</p>
        <button type="button" class="btn btn-sm btn-outline" id="clear-file">Remover</button>
      </div>
    `;
    
    // Adiciona event listener para o botão de remover
    const clearButton = dropZone.querySelector('#clear-file');
    clearButton.addEventListener('click', (e) => {
      e.stopPropagation();
      dropZone.innerHTML = originalHTML;
      
      // Limpa o input de arquivo
      const input = document.getElementById(dropZone.id.replace('-drop-zone', ''));
      if (input) {
        input.value = '';
      }
    });
  }
}

// Carrega os LUTs existentes
function loadExistingLUTs() {
  const lutsList = document.getElementById('luts-list');
  const luts = getLUTs();
  
  if (luts.length === 0) {
    lutsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎨</div>
        <h3>Nenhum LUT encontrado</h3>
        <p>Adicione um novo LUT usando o formulário ao lado.</p>
      </div>
    `;
    return;
  }
  
  // Limpa a mensagem de carregamento
  lutsList.innerHTML = '';
  
  // Cria a tabela de LUTs
  const table = document.createElement('div');
  table.className = 'responsive-table';
  
  table.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Miniatura</th>
          <th>Nome</th>
          <th>Descrição</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="luts-table-body">
      </tbody>
    </table>
  `;
  
  lutsList.appendChild(table);
  
  const tableBody = document.getElementById('luts-table-body');
  
  // Adiciona cada LUT à tabela
  luts.forEach(lut => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>
        <img src="${lut.thumbnail || 'placeholder.jpg'}" alt="${lut.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
      </td>
      <td>${lut.name}</td>
      <td>${lut.description || '-'}</td>
      <td>
        <button class="btn btn-sm edit-lut" data-id="${lut.id}">
          <i class="icon">✏️</i> Editar
        </button>
        <button class="btn btn-sm btn-danger delete-lut" data-id="${lut.id}">
          <i class="icon">🗑️</i> Excluir
        </button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Adiciona event listeners para os botões de edição e exclusão
  document.querySelectorAll('.edit-lut').forEach(button => {
    button.addEventListener('click', handleEditLUT);
  });
  
  document.querySelectorAll('.delete-lut').forEach(button => {
    button.addEventListener('click', handleDeleteLUT);
  });
}

// Manipula a adição de um novo LUT
async function handleAddLUT(event) {
  event.preventDefault();
  
  // Obtém os valores do formulário
  const name = document.getElementById('lut-name').value;
  const description = document.getElementById('lut-description').value;
  
  // Configuração manual dos canais
  const rOffset = parseInt(document.getElementById('r-offset').value);
  const rFactor = parseFloat(document.getElementById('r-factor').value);
  const gOffset = parseInt(document.getElementById('g-offset').value);
  const gFactor = parseFloat(document.getElementById('g-factor').value);
  const bOffset = parseInt(document.getElementById('b-offset').value);
  const bFactor = parseFloat(document.getElementById('b-factor').value);
  
  // Cria o objeto LUT
  const lutData = {
    name,
    description,
    r: { offset: rOffset, factor: rFactor },
    g: { offset: gOffset, factor: gFactor },
    b: { offset: bOffset, factor: bFactor }
  };
  
  // Processa a miniatura, se fornecida
  const thumbnailInput = document.getElementById('lut-thumbnail');
  if (thumbnailInput.files.length > 0) {
    try {
      const thumbnailFile = thumbnailInput.files[0];
      const reader = new FileReader();
      
      // Lê a miniatura como Data URL
      await new Promise((resolve, reject) => {
        reader.onload = (e) => {
          lutData.thumbnail = e.target.result;
          resolve();
        };
        reader.onerror = reject;
        reader.readAsDataURL(thumbnailFile);
      });
    } catch (error) {
      console.error('Erro ao processar miniatura:', error);
    }
  } else {
    // Usa uma miniatura padrão
    lutData.thumbnail = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAnElEQVR42u3RAQ0AAAjDMO5fNCCDkC5z0HUrWkEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEI8tsCEKAA3xhwqh8AAAAASUVORK5CYII=';
  }
  
  // Mostra um indicador de carregamento
  const submitButton = document.querySelector('#add-lut-form button[type="submit"]');
  const originalButtonText = submitButton.innerHTML;
  submitButton.innerHTML = '<div class="loader" style="width: 20px; height: 20px;"></div> Adicionando...';
  submitButton.disabled = true;
  
  // Salva o LUT
  const result = saveLUT(lutData);
  
  // Restaura o botão
  submitButton.innerHTML = originalButtonText;
  submitButton.disabled = false;
  
  if (result.success) {
    showNotification('LUT adicionado com sucesso!', 'success');
    
    // Limpa o formulário
    document.getElementById('add-lut-form').reset();
    
    // Restaura as zonas de drop
    resetDropZones();
    
    // Recarrega a lista de LUTs
    loadExistingLUTs();
  } else {
    showNotification(`Erro ao adicionar LUT: ${result.error}`, 'error');
  }
}

// Reseta as zonas de drop para o estado inicial
function resetDropZones() {
  const lutDropZone = document.getElementById('lut-drop-zone');
  if (lutDropZone) {
    lutDropZone.innerHTML = `
      <div class="drop-zone-icon">📁</div>
      <p>Arraste e solte um arquivo LUT aqui ou clique para selecionar</p>
      <small>Formatos suportados: .cube, .3dl</small>
      <input type="file" id="lut-file" class="form-control" accept=".cube,.3dl" style="display: none;">
    `;
    
    // Readiciona o event listener
    const lutFileInput = document.getElementById('lut-file');
    lutFileInput.addEventListener('change', handleLUTFileChange);
  }
  
  const thumbnailDropZone = document.getElementById('thumbnail-drop-zone');
  if (thumbnailDropZone) {
    thumbnailDropZone.innerHTML = `
      <div class="drop-zone-icon">🖼️</div>
      <p>Arraste e solte uma imagem para usar como miniatura ou clique para selecionar</p>
      <input type="file" id="lut-thumbnail" class="form-control" accept="image/*" style="display: none;">
    `;
  }
  
  // Reconfigura as zonas de drop
  setupDropZone('lut-drop-zone', 'lut-file', handleLUTFileChange);
  setupDropZone('thumbnail-drop-zone', 'lut-thumbnail');
}

// Manipula a mudança de arquivo LUT
async function handleLUTFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    // Mostra um indicador de carregamento
    const dropZone = document.getElementById('lut-drop-zone');
    const originalContent = dropZone.innerHTML;
    dropZone.innerHTML = `
      <div style="text-align: center;">
        <div class="loader"></div>
        <p>Analisando arquivo LUT...</p>
      </div>
    `;
    
    // Carrega o arquivo LUT
    const lutData = await loadLUTFile(file);
    
    // Restaura a zona de drop com o nome do arquivo
    updateDropZoneVisual(dropZone, file);
    
    // Preenche os campos do formulário com os dados do LUT
    document.getElementById('r-offset').value = lutData.r.offset;
    document.getElementById('r-factor').value = lutData.r.factor;
    document.getElementById('g-offset').value = lutData.g.offset;
    document.getElementById('g-factor').value = lutData.g.factor;
    document.getElementById('b-offset').value = lutData.b.offset;
    document.getElementById('b-factor').value = lutData.b.factor;
    
    // Se o nome do LUT não estiver preenchido, usa o nome do arquivo
    const nameInput = document.getElementById('lut-name');
    if (!nameInput.value) {
      nameInput.value = lutData.name;
    }
    
    showNotification('Arquivo LUT carregado com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao carregar arquivo LUT:', error);
    showNotification('Erro ao carregar o arquivo LUT. Verifique se o formato é suportado.', 'error');
    
    // Restaura a zona de drop
    resetDropZones();
  }
}

// Manipula a edição de um LUT
function handleEditLUT(event) {
  const lutId = event.target.closest('.edit-lut').dataset.id;
  const lut = getLUTById(lutId);
  
  if (!lut) {
    showNotification('LUT não encontrado.', 'error');
    return;
  }
  
  // Cria um modal para edição
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Editar LUT: ${lut.name}</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="edit-lut-form">
          <div class="form-group">
            <label for="edit-lut-name">Nome do LUT</label>
            <input type="text" id="edit-lut-name" class="form-control" value="${lut.name}" required>
          </div>
          
          <div class="form-group">
            <label for="edit-lut-description">Descrição</label>
            <textarea id="edit-lut-description" class="form-control" rows="3">${lut.description || ''}</textarea>
          </div>
          
          <div class="card" style="margin-top: 1rem; background-color: #f8f9fa;">
            <h4>Configuração dos Canais</h4>
            
            <div class="form-group">
              <label>Canal Vermelho (R)</label>
              <div style="display: flex; gap: 1rem;">
                <div style="flex: 1;">
                  <label for="edit-r-offset">Offset</label>
                  <input type="number" id="edit-r-offset" class="form-control" value="${lut.r.offset}" min="-255" max="255">
                </div>
                <div style="flex: 1;">
                  <label for="edit-r-factor">Fator</label>
                  <input type="number" id="edit-r-factor" class="form-control" value="${lut.r.factor}" min="0" max="2" step="0.1">
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Canal Verde (G)</label>
              <div style="display: flex; gap: 1rem;">
                <div style="flex: 1;">
                  <label for="edit-g-offset">Offset</label>
                  <input type="number" id="edit-g-offset" class="form-control" value="${lut.g.offset}" min="-255" max="255">
                </div>
                <div style="flex: 1;">
                  <label for="edit-g-factor">Fator</label>
                  <input type="number" id="edit-g-factor" class="form-control" value="${lut.g.factor}" min="0" max="2" step="0.1">
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Canal Azul (B)</label>
              <div style="display: flex; gap: 1rem;">
                <div style="flex: 1;">
                  <label for="edit-b-offset">Offset</label>
                  <input type="number" id="edit-b-offset" class="form-control" value="${lut.b.offset}" min="-255" max="255">
                </div>
                <div style="flex: 1;">
                  <label for="edit-b-factor">Fator</label>
                  <input type="number" id="edit-b-factor" class="form-control" value="${lut.b.factor}" min="0" max="2" step="0.1">
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="edit-lut-thumbnail">Nova Miniatura (opcional)</label>
            <div class="drop-zone" id="edit-thumbnail-drop-zone">
              <div style="text-align: center;">
                <img src="${lut.thumbnail || 'placeholder.jpg'}" alt="${lut.name}" style="max-width: 100%; max-height: 150px; margin-bottom: 0.5rem;">
                <p>Clique para alterar a miniatura</p>
              </div>
              <input type="file" id="edit-lut-thumbnail" class="form-control" accept="image/*" style="display: none;">
            </div>
          </div>
          
          <input type="hidden" id="edit-lut-id" value="${lut.id}">
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn" id="cancel-edit">Cancelar</button>
        <button class="btn btn-success" id="save-edit">Salvar Alterações</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Configura a zona de drop para a miniatura
  setupDropZone('edit-thumbnail-drop-zone', 'edit-lut-thumbnail');
  
  // Adiciona event listeners para o modal
  const closeButton = modal.querySelector('.close-modal');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Fecha o modal ao clicar fora dele
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  
  // Event listener para o botão de cancelar
  const cancelButton = document.getElementById('cancel-edit');
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Event listener para o botão de salvar
  const saveButton = document.getElementById('save-edit');
  saveButton.addEventListener('click', async () => {
    // Obtém os valores do formulário
    const name = document.getElementById('edit-lut-name').value;
    const description = document.getElementById('edit-lut-description').value;
    const rOffset = parseInt(document.getElementById('edit-r-offset').value);
    const rFactor = parseFloat(document.getElementById('edit-r-factor').value);
    const gOffset = parseInt(document.getElementById('edit-g-offset').value);
    const gFactor = parseFloat(document.getElementById('edit-g-factor').value);
    const bOffset = parseInt(document.getElementById('edit-b-offset').value);
    const bFactor = parseFloat(document.getElementById('edit-b-factor').value);
    const lutId = document.getElementById('edit-lut-id').value;
    
    // Cria o objeto com as atualizações
    const updates = {
      name,
      description,
      r: { offset: rOffset, factor: rFactor },
      g: { offset: gOffset, factor: gFactor },
      b: { offset: bOffset, factor: bFactor }
    };
    
    // Processa a nova miniatura, se fornecida
    const thumbnailInput = document.getElementById('edit-lut-thumbnail');
    if (thumbnailInput.files.length > 0) {
      try {
        const thumbnailFile = thumbnailInput.files[0];
        const reader = new FileReader();
        
        // Lê a miniatura como Data URL
        await new Promise((resolve, reject) => {
          reader.onload = (e) => {
            updates.thumbnail = e.target.result;
            resolve();
          };
          reader.onerror = reject;
          reader.readAsDataURL(thumbnailFile);
        });
      } catch (error) {
        console.error('Erro ao processar nova miniatura:', error);
      }
    }
    
    // Mostra um indicador de carregamento
    saveButton.innerHTML = '<div class="loader" style="width: 20px; height: 20px;"></div> Salvando...';
    saveButton.disabled = true;
    
    // Atualiza o LUT
    const result = updateLUT(lutId, updates);
    
    if (result.success) {
      showNotification('LUT atualizado com sucesso!', 'success');
      
      // Fecha o modal
      document.body.removeChild(modal);
      
      // Recarrega a lista de LUTs
      loadExistingLUTs();
    } else {
      showNotification(`Erro ao atualizar LUT: ${result.error}`, 'error');
      
      // Restaura o botão
      saveButton.innerHTML = 'Salvar Alterações';
      saveButton.disabled = false;
    }
  });
}

// Manipula a exclusão de um LUT
function handleDeleteLUT(event) {
  const lutId = event.target.closest('.delete-lut').dataset.id;
  const lut = getLUTById(lutId);
  
  if (!lut) {
    showNotification('LUT não encontrado.', 'error');
    return;
  }
  
  // Cria um modal de confirmação
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Confirmar Exclusão</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <p>Tem certeza que deseja excluir o LUT "${lut.name}"? Esta ação não pode ser desfeita.</p>
        <div style="margin-top: 1rem; text-align: center;">
          <img src="${lut.thumbnail || 'placeholder.jpg'}" alt="${lut.name}" style="max-width: 100px; max-height: 100px; border-radius: 4px;">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" id="cancel-delete">Cancelar</button>
        <button class="btn btn-danger" id="confirm-delete">Excluir</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listeners para o modal
  modal.querySelector('.close-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.querySelector('#cancel-delete').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.querySelector('#confirm-delete').addEventListener('click', () => {
    // Mostra um indicador de carregamento
    const deleteButton = modal.querySelector('#confirm-delete');
    deleteButton.innerHTML = '<div class="loader" style="width: 20px; height: 20px;"></div> Excluindo...';
    deleteButton.disabled = true;
    
    // Exclui o LUT
    const result = deleteLUT(lutId);
    
    if (result.success) {
      showNotification('LUT excluído com sucesso!', 'success');
      
      // Remove o modal
      document.body.removeChild(modal);
      
      // Recarrega a lista de LUTs
      loadExistingLUTs();
    } else {
      showNotification(`Erro ao excluir LUT: ${result.error}`, 'error');
      
      // Restaura o botão
      deleteButton.innerHTML = 'Excluir';
      deleteButton.disabled = false;
    }
  });
}

// Mostra uma notificação
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification notification-${type}`;
  notification.style.display = 'block';
  
  // Remove a notificação após 3 segundos
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}
