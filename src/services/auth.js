// Serviço de autenticação

// Chave para armazenar o token no localStorage
const TOKEN_KEY = 'photo_editor_auth_token';

// Inicializa o serviço de autenticação
export function initAuth() {
  // Verifica se há um token salvo e se ele ainda é válido
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    try {
      // Em uma aplicação real, você verificaria a validade do token aqui
      // Por enquanto, apenas verificamos se ele existe
      console.log('Usuário autenticado');
    } catch (error) {
      console.error('Token inválido:', error);
      logout();
    }
  }
}

// Função para fazer login
export async function login(email, password) {
  try {
    // Em uma aplicação real, você faria uma requisição para o servidor
    // Por enquanto, simulamos uma autenticação simples
    if (email === 'admin@example.com' && password === 'admin123') {
      // Simula um token JWT
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      localStorage.setItem(TOKEN_KEY, token);
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'Credenciais inválidas' 
      };
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { 
      success: false, 
      error: 'Erro ao fazer login. Tente novamente.' 
    };
  }
}

// Função para fazer logout
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = '/';
}

// Verifica se o usuário está autenticado
export function isAuthenticated() {
  return localStorage.getItem(TOKEN_KEY) !== null;
}

// Obtém o token de autenticação
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Obtém informações do usuário a partir do token
export function getUserInfo() {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Em uma aplicação real, você decodificaria o token JWT
    // Por enquanto, retornamos informações fixas
    return {
      id: 1,
      name: 'Admin',
      email: 'admin@example.com',
      role: 'admin'
    };
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
}
