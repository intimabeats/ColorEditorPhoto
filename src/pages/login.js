import { login } from '../services/auth.js';
import { navigateTo } from '../router.js';

// Renderiza a página de login
export function renderLogin(redirectTo = '/') {
  const contentElement = document.getElementById('content');
  
  // Estrutura HTML da página de login
  contentElement.innerHTML = `
    <div class="login-container" style="max-width: 400px; margin: 0 auto;">
      <div class="card">
        <h2>Login</h2>
        <p>Faça login para acessar o painel de administração.</p>
        
        <div id="login-error" class="alert alert-danger" style="display: none;"></div>
        
        <form id="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" class="form-control" required>
          </div>
          
          <div class="form-group">
            <label for="password">Senha</label>
            <input type="password" id="password" class="form-control" required>
          </div>
          
          <button type="submit" class="btn btn-success" style="width: 100%;">Entrar</button>
        </form>
        
        <div style="margin-top: 1rem; text-align: center;">
          <p>Credenciais de demonstração:</p>
          <p><strong>Email:</strong> admin@example.com</p>
          <p><strong>Senha:</strong> admin123</p>
        </div>
      </div>
    </div>
  `;
  
  // Adiciona o event listener para o formulário de login
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Obtém os valores do formulário
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Tenta fazer login
    const result = await login(email, password);
    
    if (result.success) {
      // Redireciona para a página solicitada após o login
      navigateTo(redirectTo);
    } else {
      // Exibe a mensagem de erro
      const errorElement = document.getElementById('login-error');
      errorElement.textContent = result.error || 'Erro ao fazer login. Verifique suas credenciais.';
      errorElement.style.display = 'block';
    }
  });
}
