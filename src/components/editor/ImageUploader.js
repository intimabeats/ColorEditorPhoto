/**
 * Componente para upload de imagens
 */
export function createImageUploader(options = {}) {
  const {
    onImageSelected = () => {}
  } = options;
  
  // Cria o container de upload
  const container = document.createElement('div');
  container.className = 'upload-container';
  
  // Cria a área de upload
  const uploadArea = document.createElement('div');
  uploadArea.className = 'upload-area';
  uploadArea.innerHTML = `
    <div class="upload-icon">
      <i class="fas fa-cloud-upload-alt"></i>
    </div>
    <div class="upload-text">Arraste e solte uma imagem aqui</div>
    <div class="upload-subtext">ou clique para selecionar um arquivo</div>
    <input type="file" class="upload-input" accept="image/*">
  `;
  
  container.appendChild(uploadArea);
  
  // Obtém o input de arquivo
  const fileInput = uploadArea.querySelector('.upload-input');
  
  // Adiciona event listeners
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });
  
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('active');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('active');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('active');
    
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  });
  
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleFiles(fileInput.files);
    }
  });
  
  // Função para processar os arquivos
  function handleFiles(files) {
    const file = files[0];
    
    // Verifica se é uma imagem
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem.');
      return;
    }
    
    // Lê o arquivo como Data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      onImageSelected(e.target.result, file);
    };
    
    reader.readAsDataURL(file);
  }
  
  return {
    element: container,
    
    // Remove o uploader do DOM
    remove: () => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  };
}
