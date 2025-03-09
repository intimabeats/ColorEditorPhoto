// Componente para upload de imagens

// Cria um componente de upload de imagens
export function createImageUploader(options = {}) {
  const {
    onImageSelected,
    onError,
    maxSize = 5 * 1024 * 1024, // 5MB por padrão
    acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    multiple = false,
    dropZoneText = 'Arraste e solte imagens aqui ou clique para selecionar'
  } = options;
  
  // Cria o elemento do uploader
  const uploader = document.createElement('div');
  uploader.className = 'image-uploader';
  
  // Cria a zona de drop
  const dropZone = document.createElement('div');
  dropZone.className = 'drop-zone';
  dropZone.innerHTML = `
    <div class="drop-zone-content">
      <i class="drop-zone-icon">📁</i>
      <p class="drop-zone-text">${dropZoneText}</p>
    </div>
    <input type="file" class="file-input" ${multiple ? 'multiple' : ''} accept="${acceptedTypes.join(',')}">
  `;
  
  uploader.appendChild(dropZone);
  
  // Obtém o input de arquivo
  const fileInput = dropZone.querySelector('.file-input');
  
  // Adiciona event listeners
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drop-zone-active');
  });
  
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drop-zone-active');
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drop-zone-active');
    
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
    const validFiles = [];
    
    // Verifica cada arquivo
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Verifica o tipo
      if (!acceptedTypes.includes(file.type)) {
        if (onError) {
          onError(`Tipo de arquivo não suportado: ${file.type}`);
        }
        continue;
      }
      
      // Verifica o tamanho
      if (file.size > maxSize) {
        if (onError) {
          onError(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (máximo: ${(maxSize / 1024 / 1024).toFixed(2)}MB)`);
        }
        continue;
      }
      
      validFiles.push(file);
    }
    
    // Se houver arquivos válidos, chama o callback
    if (validFiles.length > 0) {
      if (onImageSelected) {
        onImageSelected(multiple ? validFiles : validFiles[0]);
      }
    }
    
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    fileInput.value = '';
  }
  
  return uploader;
}

// Adiciona estilos CSS para o uploader
export function addUploaderStyles() {
  // Verifica se os estilos já foram adicionados
  if (document.getElementById('image-uploader-styles')) {
    return;
  }
  
  // Cria o elemento de estilo
  const style = document.createElement('style');
  style.id = 'image-uploader-styles';
  
  // Define os estilos
  style.textContent = `
    .image-uploader {
      width: 100%;
      margin-bottom: 1rem;
    }
    
    .drop-zone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.3s, background-color 0.3s;
    }
    
    .drop-zone:hover {
      border-color: #999;
      background-color: #f9f9f9;
    }
    
    .drop-zone-active {
      border-color: #3498db;
      background-color: #ecf0f1;
    }
    
    .drop-zone-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      display: block;
    }
    
    .drop-zone-text {
      margin: 0;
      color: #666;
    }
    
    .file-input {
      display: none;
    }
  `;
  
  // Adiciona os estilos ao documento
  document.head.appendChild(style);
}
