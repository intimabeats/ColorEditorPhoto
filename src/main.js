/**
 * Ponto de entrada da aplicação
 */
import { initStorage } from './modules/storage.js';
import { createBasicUI } from './app.js';

// Inicializa a aplicação
export function initApp() {
  console.log('Inicializando aplicação...');
  
  try {
    // Inicializa o armazenamento
    initStorage();
    
    // Cria a interface básica
    createBasicUI();
    
    console.log('Aplicação inicializada com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar a aplicação:', error);
    
    // Exibe mensagem de erro na interface
    const appElement = document.getElementById('app');
    if (appElement) {
      appElement.innerHTML = `
        <div style="padding: 20px; color: white; text-align: center;">
          <h2>Erro ao inicializar a aplicação</h2>
          <p>${error.message || 'Ocorreu um erro desconhecido'}</p>
          <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
            Tentar novamente
          </button>
        </div>
      `;
    }
  }
}
