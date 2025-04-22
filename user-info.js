// Script para carregar e exibir as informações do usuário logado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    const usuarioData = localStorage.getItem('usuarioOdontoLegal');
    
    if (!usuarioData) {
        console.warn('Usuário não está logado. Redirecionando para a página de login...');
        // Redirecionar para a página de login
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Converter dados do usuário de JSON para objeto
        const usuario = JSON.parse(usuarioData);
        
        // Atualizar nome do usuário na interface
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            // Usar o primeiro nome e segundo nome em vez do nome completo
            const nomeExibir = (usuario.primeiro_nome && usuario.segundo_nome) ? 
                `${usuario.primeiro_nome} ${usuario.segundo_nome}` : 
                (usuario.nome || 'Usuário');
            
            userNameElement.textContent = nomeExibir;
        }
        
        // Atualizar tipo de perfil na interface
        const userRoleElement = document.getElementById('userRole');
        if (userRoleElement) {
            userRoleElement.textContent = usuario.tipo_perfil || 'Perfil não definido';
        }
        
        // Atualizar imagem de perfil se disponível
        const userProfileImageElement = document.getElementById('userProfileImage');
        if (userProfileImageElement && usuario.foto_perfil) {
            userProfileImageElement.src = usuario.foto_perfil;
        }
        
        console.log('Informações do usuário carregadas com sucesso');
    } catch (error) {
        console.error('Erro ao processar dados do usuário:', error);
    }
    
    // Adicionar funcionalidade de logout (opcional)
    const logoutButton = document.createElement('button');
    logoutButton.id = 'logoutBtn';
    logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
    logoutButton.title = 'Sair';
    logoutButton.className = 'logout-btn';
    
    // Adicionar estilo para o botão de logout
    const style = document.createElement('style');
    style.textContent = `
        .logout-btn {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            margin-left: 10px;
            padding: 5px;
        }
        .logout-btn:hover {
            color: #ff6b6b;
        }
    `;
    document.head.appendChild(style);
    
    // Adicionar botão ao container de informações do usuário
    document.querySelector('.user-info').appendChild(logoutButton);
    
    // Adicionar evento de clique para logout
    logoutButton.addEventListener('click', function() {
        // Remover dados do usuário do localStorage
        localStorage.removeItem('usuarioOdontoLegal');
        // Redirecionar para a página de login
        window.location.href = 'login.html';
    });
});