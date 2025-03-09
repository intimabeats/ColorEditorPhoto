import { getEditedImages, getLUTById, deleteEditedImage } from '../services/storage.js';

// Renderiza a página da galeria
export function renderGallery() {
  const contentElement = document.getElementById('content');
  
  // Estrutura HTML da galeria
  contentElement.innerHTML = `
    <div class="page-header">
      <h2>Galeria de Imagens Editadas</h2>
      <p>Veja todas as suas imagens editadas com LUTs.</p>
    </div>
    
    <div id="gallery-container" class="gallery-container">
      <div class="loading-message">
        <div class="loader"></div>
        <p>Carregando imagens...</p>
      </div>
    </div>
    
    <div id="notification" class="notification" style="display: none;"></div>
  `;
  
  // Carrega as imagens editadas
  loadEditedImages();
}

// Carrega as imagens editadas
function loadEditedImages() {
  const galleryContainer = document.getElementById('gallery-container');
  const images = getEditedImages();
  
  if (images.length === 0) {
    galleryContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🖼️</div>
        <h3>Nenhuma imagem encontrada</h3>
        <p>Edite algumas imagens primeiro para vê-las aqui.</p>
        <a href="/" class="btn btn-primary">Ir para o Editor</a>
      </div>
    `;
    return;
  }
  
  // Limpa a mensagem de carregamento
  galleryContainer.innerHTML = '';
  
  // Cria a grade de imagens
  const galleryGrid = document.createElement('div');
  galleryGrid.className = 'gallery-grid';
  
  // Adiciona cada imagem à grade
  images.forEach(image => {
    const lutInfo = getLUTById(image.lutId) || { name: 'LUT Desconhecido' };
    
    const imageElement = document.createElement('div');
    imageElement.className = 'gallery-item card';
    
    // Formata a data de criação
    const createdDate = new Date(image.createdAt);
    const formattedDate = createdDate.toLocaleDateString() + ' ' + createdDate.toLocaleTimeString();
    
    imageElement.innerHTML = `
      <div class="gallery-image">
        <img src="${image.imageData}" alt="Imagem editada" loading="lazy">
      </div>
      <div class="gallery-info">
        <p><strong>LUT:</strong> ${lutInfo.name}</p>
        <p><strong>Data:</strong> ${formattedDate}</p>
        <div class="gallery-actions">
          <button class="btn download-image" data-id="${image.id}">
            <i class="icon">⬇️</i> Baixar
          </button>
          <button class="btn btn-danger delete-image" data-id="${image.id}">
            <i class="icon">🗑️</i> Excluir
          </button>
        </div>
      </div>
    `;
    
    galleryGrid.appendChild(imageElement);
  });
  
  galleryContainer.appendChild(galleryGrid);
  
  // Adiciona event listeners para os botões
  setupGalleryEventListeners();
}

// Configura os event listeners para a galeria
function setupGalleryEventListeners() {
  // Event listeners para os botões de download
  document.querySelectorAll('.download-image').forEach(button => {
    button.addEventListener('click', handleDownloadImage);
  });
  
  // Event listeners para os botões de exclusão
  document.querySelectorAll('.delete-image').forEach(button => {
    button.addEventListener('click', handleDeleteImage);
  });
}

// Manipula o download de uma imagem
function handleDownloadImage(event) {
  const imageId = event.target.closest('.download-image').dataset.id;
  const images = getEditedImages();
  const image = images.find(img => img.id === imageId);
  
  if (!image) {
    showNotification('Imagem não encontrada.', 'error');
    return;
  }
  
  // Cria um link para download
  const link = document.createElement('a');
  link.href = image.imageData;
  link.download = `edited_image_${imageId}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Download iniciado!', 'success');
}

// Manipula a exclusão de uma imagem
function handleDeleteImage(event) {
  const imageId = event.target.closest('.delete-image').dataset.id;
  
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
        <p>Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita.</p>
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
    const result = deleteEditedImage(imageId);
    
    if (result.success) {
      showNotification('Imagem excluída com sucesso!', 'success');
      
      // Remove o modal
      document.body.removeChild(modal);
      
      // Recarrega a galeria
      renderGallery();
    } else {
      showNotification(`Erro ao excluir a imagem: ${result.error}`, 'error');
      
      // Remove o modal
      document.body.removeChild(modal);
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
