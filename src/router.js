import { renderEditor } from './pages/editor.js';
import { renderGallery } from './pages/gallery.js';
import { renderAdmin } from './pages/admin.js';
import { renderLogin } from './pages/login.js';
import { isAuthenticated } from './services/auth.js';

// Configuração das rotas
const routes = {
  '/': renderEditor,
  '/galeria': renderGallery,
  '/admin': () => {
    if (isAuthenticated()) {
      renderAdmin();
    } else {
      renderLogin('/admin');
    }
  },
  '/login': renderLogin
};

// Função para navegar entre as páginas
export function navigateTo(path) {
  window.history.pushState({}, '', path);
  handleRoute();
}

// Função para lidar com a rota atual
function handleRoute() {
  const path = window.location.pathname;
  const renderFunction = routes[path] || (() => {
    document.getElementById('content').innerHTML = '<h2>Página não encontrada</h2>';
  });
  
  renderFunction();
  
  // Atualiza a navegação ativa
  document.querySelectorAll('#main-nav a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
    }
  });
}

// Inicializa o roteador
export function initRouter() {
  // Adiciona event listeners para navegação
  document.addEventListener('click', e => {
    if (e.target.matches('a') && e.target.href.includes(window.location.origin)) {
      e.preventDefault();
      navigateTo(e.target.getAttribute('href'));
    }
  });

  // Adiciona event listener para botão voltar/avançar do navegador
  window.addEventListener('popstate', handleRoute);
  
  // Carrega a rota inicial
  handleRoute();
}
