// Script de inicialização do aplicativo
import { initStorage } from './services/storage.js';

// Inicializa o armazenamento com dados de exemplo
export function initApp() {
  console.log('Inicializando o aplicativo...');
  
  // Inicializa o armazenamento
  initStorage();
  
  console.log('Aplicativo inicializado com sucesso!');
}
