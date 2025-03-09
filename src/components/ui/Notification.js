/**
 * Exibe uma notificação na interface
 */
export function showNotification(options = {}) {
  const {
    title = 'Notificação',
    message = '',
    type = 'info', // 'info', 'success', 'error'
    duration = 3000
  } = options;
  
  // Remove notificações existentes
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => {
    notification.remove();
  });
  
  // Cria o elemento de notificação
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  // Define o ícone com base no tipo
  let icon = 'fas fa-info-circle';
  if (type === 'success') {
    icon = 'fas fa-check-circle';
  } else if (type === 'error') {
    icon = 'fas fa-exclamation-circle';
  }
  
  // Estrutura da notificação
  notification.innerHTML = `
    <div class="notification-icon">
      <i class="${icon}"></i>
    </div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
  `;
  
  // Adiciona a notificação ao DOM
  document.body.appendChild(notification);
  
  // Remove a notificação após o tempo especificado
  setTimeout(() => {
    notification.remove();
  }, duration);
  
  return notification;
}
