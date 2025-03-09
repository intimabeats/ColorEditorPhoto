// Serviço para armazenamento de dados

// Função para salvar LUTs no localStorage
export function saveLUT(lutData) {
  try {
    // Obtém a lista atual de LUTs
    const luts = getLUTs();
    
    // Gera um ID único para o LUT
    lutData.id = Date.now().toString();
    
    // Adiciona o novo LUT à lista
    luts.push(lutData);
    
    // Salva a lista atualizada
    localStorage.setItem('photo_editor_luts', JSON.stringify(luts));
    
    return { success: true, lutData };
  } catch (error) {
    console.error('Erro ao salvar LUT:', error);
    return { success: false, error: 'Erro ao salvar LUT' };
  }
}

// Função para obter todos os LUTs
export function getLUTs() {
  try {
    const lutsJSON = localStorage.getItem('photo_editor_luts');
    return lutsJSON ? JSON.parse(lutsJSON) : [];
  } catch (error) {
    console.error('Erro ao obter LUTs:', error);
    return [];
  }
}

// Função para obter um LUT específico por ID
export function getLUTById(id) {
  try {
    const luts = getLUTs();
    return luts.find(lut => lut.id === id) || null;
  } catch (error) {
    console.error('Erro ao obter LUT por ID:', error);
    return null;
  }
}

// Função para atualizar um LUT
export function updateLUT(id, updatedData) {
  try {
    // Obtém a lista atual de LUTs
    const luts = getLUTs();
    
    // Encontra o índice do LUT a ser atualizado
    const index = luts.findIndex(lut => lut.id === id);
    
    if (index === -1) {
      return { success: false, error: 'LUT não encontrado' };
    }
    
    // Atualiza o LUT
    luts[index] = { ...luts[index], ...updatedData };
    
    // Salva a lista atualizada
    localStorage.setItem('photo_editor_luts', JSON.stringify(luts));
    
    return { success: true, lutData: luts[index] };
  } catch (error) {
    console.error('Erro ao atualizar LUT:', error);
    return { success: false, error: 'Erro ao atualizar LUT' };
  }
}

// Função para excluir um LUT
export function deleteLUT(id) {
  try {
    // Obtém a lista atual de LUTs
    const luts = getLUTs();
    
    // Filtra o LUT a ser excluído
    const updatedLUTs = luts.filter(lut => lut.id !== id);
    
    // Salva a lista atualizada
    localStorage.setItem('photo_editor_luts', JSON.stringify(updatedLUTs));
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir LUT:', error);
    return { success: false, error: 'Erro ao excluir LUT' };
  }
}

// Função para salvar uma imagem editada
export function saveEditedImage(imageData, lutId) {
  try {
    // Obtém a lista atual de imagens editadas
    const images = getEditedImages();
    
    // Cria um objeto para a nova imagem
    const newImage = {
      id: Date.now().toString(),
      imageData,
      lutId,
      createdAt: new Date().toISOString()
    };
    
    // Adiciona a nova imagem à lista
    images.push(newImage);
    
    // Salva a lista atualizada
    localStorage.setItem('photo_editor_images', JSON.stringify(images));
    
    return { success: true, imageId: newImage.id };
  } catch (error) {
    console.error('Erro ao salvar imagem editada:', error);
    return { success: false, error: 'Erro ao salvar imagem' };
  }
}

// Função para obter todas as imagens editadas
export function getEditedImages() {
  try {
    const imagesJSON = localStorage.getItem('photo_editor_images');
    return imagesJSON ? JSON.parse(imagesJSON) : [];
  } catch (error) {
    console.error('Erro ao obter imagens editadas:', error);
    return [];
  }
}

// Função para obter uma imagem editada específica por ID
export function getEditedImageById(id) {
  try {
    const images = getEditedImages();
    return images.find(image => image.id === id) || null;
  } catch (error) {
    console.error('Erro ao obter imagem por ID:', error);
    return null;
  }
}

// Função para excluir uma imagem editada
export function deleteEditedImage(id) {
  try {
    // Obtém a lista atual de imagens
    const images = getEditedImages();
    
    // Filtra a imagem a ser excluída
    const updatedImages = images.filter(image => image.id !== id);
    
    // Salva a lista atualizada
    localStorage.setItem('photo_editor_images', JSON.stringify(updatedImages));
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir imagem:', error);
    return { success: false, error: 'Erro ao excluir imagem' };
  }
}

// Inicializa o armazenamento com alguns LUTs de exemplo
export function initStorage() {
  // Verifica se já existem LUTs
  if (getLUTs().length === 0) {
    // Adiciona alguns LUTs de exemplo
    const exampleLUTs = [
      {
        id: '1',
        name: 'Vintage',
        description: 'Um filtro com tons sépia para um visual retrô',
        thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAnElEQVR42u3RAQ0AAAjDMO5fNCCDkC5z0HUrWkEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEI8tsCEKAA3xhwqh8AAAAASUVORK5CYII=',
        r: { offset: 20, factor: 1.1 },
        g: { offset: 10, factor: 0.9 },
        b: { offset: -10, factor: 0.8 }
      },
      {
        id: '2',
        name: 'Frio',
        description: 'Um filtro com tons azulados para um visual frio',
        thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAnElEQVR42u3RAQ0AAAjDMO5fNCCDkC5z0HUrWkEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEI8tsCEKAA3xhwqh8AAAAASUVORK5CYII=',
        r: { offset: -10, factor: 0.9 },
        g: { offset: 0, factor: 1.0 },
        b: { offset: 20, factor: 1.2 }
      },
      {
        id: '3',
        name: 'Quente',
        description: 'Um filtro com tons avermelhados para um visual quente',
        thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAnElEQVR42u3RAQ0AAAjDMO5fNCCDkC5z0HUrWkEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQghCEIAQhCEEI8tsCEKAA3xhwqh8AAAAASUVORK5CYII=',
        r: { offset: 20, factor: 1.2 },
        g: { offset: 10, factor: 1.0 },
        b: { offset: -10, factor: 0.8 }
      }
    ];
    
    localStorage.setItem('photo_editor_luts', JSON.stringify(exampleLUTs));
  }
}
