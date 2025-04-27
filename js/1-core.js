// Adicione esta função ao arquivo 1-core.js, após o evento DOMContentLoaded

// =========================================================
// FUNÇÕES BÁSICAS DE INICIALIZAÇÃO E NAVEGAÇÃO
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
    // Referências para os elementos de navegação
    const casosHeaderLink = document.querySelector('.nav-links a:first-child');
    const listagemCasosLink = document.querySelector('.sidebar-item:first-child');
    const novoCasoLink = document.querySelector('.sidebar-item:nth-child(2)');
    
    // Adicionar referência para os links de usuários
    const listarUsuariosLink = document.querySelector('#listarUsuariosLink');
    const cadastrarUsuarioLink = document.querySelector('#cadastrarUsuarioLink');
    
    // Verificar permissões do usuário para mostrar/esconder menus
    verificarPermissoesUsuario();
    
    // Adicionar event listeners aos links principais
    if (casosHeaderLink) {
        casosHeaderLink.addEventListener('click', function(e) {
            e.preventDefault();
            carregarListagemCasos();
        });
    }
    
    if (listagemCasosLink) {
        listagemCasosLink.addEventListener('click', function(e) {
            e.preventDefault();
            carregarListagemCasos();
        });
    }
    
    if (novoCasoLink) {
        novoCasoLink.addEventListener('click', function(e) {
            e.preventDefault();
            carregarNovoCaso();
        });
    }
    
    // Adicionar event listener para o link "Listar Usuários"
    if (listarUsuariosLink) {
        listarUsuariosLink.addEventListener('click', function(e) {
            e.preventDefault();
            carregarListagemUsuarios();
        });
    }
    
    // Adicionar event listener para o link "Cadastrar Usuário"
    if (cadastrarUsuarioLink) {
        cadastrarUsuarioLink.addEventListener('click', function(e) {
            e.preventDefault();
            carregarCadastroUsuario();
        });
    }
    
    // Adicionar event listener para tornar a área de usuário clicável
    const userInfoElement = document.querySelector('.user-info');
    if (userInfoElement) {
        userInfoElement.style.cursor = 'pointer';
        userInfoElement.addEventListener('click', function(e) {
            // Verificar se o clique foi no botão de logout
            if (e.target.closest('#logoutBtn')) {
                // Não faz nada, pois o evento será tratado pelo listener do botão de logout
                return;
            }
            carregarPerfilUsuario();
        });
    }
    
    // Adicionar event listener para o botão de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Evitar que o clique propague para o userInfoElement
            realizarLogout();
        });
    }
});

// Nova função para realizar o logout
window.realizarLogout = function() {
    // Confirmar se o usuário realmente deseja sair
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        console.log('Realizando logout...');
        
        // Limpar todos os dados do localStorage
        localStorage.clear();
        
        // Redirecionar para a página de login
        window.location.href = 'login.html';
    }
};

// =========================================================
// FUNÇÕES DE GERENCIAMENTO DE PERMISSÕES
// =========================================================

// Função para verificar permissões do usuário e exibir menus adequados
function verificarPermissoesUsuario() {
    // Verificar se o usuário está logado
    const usuarioData = localStorage.getItem('usuarioOdontoLegal');
    
    if (usuarioData) {
        // Converter dados do JSON para objeto
        const usuario = JSON.parse(usuarioData);
        
        // Verificar se o usuário é Admin
        if (usuario.tipo_perfil === 'Admin') {
            // Mostrar os menus de usuários para administradores
            const usuariosHeader = document.getElementById('usuariosHeader');
            const usuariosMenu = document.getElementById('usuariosMenu');
            
            if (usuariosHeader) usuariosHeader.style.display = 'block';
            if (usuariosMenu) usuariosMenu.style.display = 'block';
        }
        
        // Aplicar permissões específicas por tipo de usuário
        aplicarPermissoesPorPerfil(usuario.tipo_perfil);
    }
}

// Função para aplicar permissões por tipo de perfil
window.aplicarPermissoesPorPerfil = function(tipoPerfil) {
    console.log('Aplicando permissões para o perfil:', tipoPerfil);
    
    // Elementos visíveis apenas para Admin
    const elementosAdmin = document.querySelectorAll('.apenas-admin');
    elementosAdmin.forEach(elem => {
        elem.style.display = tipoPerfil === 'Admin' ? '' : 'none';
    });
    
    // Elementos visíveis apenas para Perito
    const elementosPerito = document.querySelectorAll('.apenas-perito');
    elementosPerito.forEach(elem => {
        elem.style.display = tipoPerfil === 'Perito' ? '' : 'none';
    });
    
    // Elementos visíveis apenas para Assistente
    const elementosAssistente = document.querySelectorAll('.apenas-assistente');
    elementosAssistente.forEach(elem => {
        elem.style.display = tipoPerfil === 'Assistente' ? '' : 'none';
    });
    
    // Elementos visíveis para Admin ou Perito
    const elementosAdminPerito = document.querySelectorAll('.admin-ou-perito');
    elementosAdminPerito.forEach(elem => {
        elem.style.display = (tipoPerfil === 'Admin' || tipoPerfil === 'Perito') ? '' : 'none';
    });
    
    // Elementos visíveis para todos exceto Assistente
    const elementosNaoAssistente = document.querySelectorAll('.nao-assistente');
    elementosNaoAssistente.forEach(elem => {
        elem.style.display = tipoPerfil !== 'Assistente' ? '' : 'none';
    });
    
    console.log('Permissões aplicadas com sucesso');
};

// Esta função deve ser chamada sempre que uma nova página é carregada dinamicamente
window.verificarPermissoesElementos = function() {
    const usuarioData = localStorage.getItem('usuarioOdontoLegal');
    if (!usuarioData) return;
    
    const usuario = JSON.parse(usuarioData);
    aplicarPermissoesPorPerfil(usuario.tipo_perfil);
};

// =========================================================
// FUNÇÕES UTILITÁRIAS COMUNS
// =========================================================

// Função para mostrar mensagens
window.mostrarMensagem = function(elemento, texto, tipo) {
    if (!elemento) return;
    
    elemento.textContent = texto;
    elemento.className = `mensagem ${tipo}`;
    elemento.style.display = 'block';
    
    // Ocultar a mensagem após 5 segundos
    setTimeout(() => {
        elemento.style.display = 'none';
    }, 5000);
};

// Função para formatar datas
window.formatarData = function(dataString) {
    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return dataString || 'Data não disponível';
    }
};

// Função para obter classe de status
function getStatusClass(status) {
    switch(status) {
        case 'Em andamento':
            return 'status-em-andamento';
        case 'Arquivado':
            return 'status-arquivado';
        case 'Finalizado':
            return 'status-finalizado';
        default:
            return '';
    }
}

// Função para validar campos obrigatórios de um formulário
window.validarCamposObrigatorios = function(formData, campos) {
    for (const campo of campos) {
        if (!formData[campo]) {
            return false;
        }
    }
    return true;
};

// Função para verificar se o usuário está logado
window.verificarUsuarioLogado = function() {
    const usuarioData = localStorage.getItem('usuarioOdontoLegal');
    if (!usuarioData) {
        window.location.href = 'login.html';
        return false;
    }
    return JSON.parse(usuarioData);
};

// Função para atualizar o header com os dados do usuário
window.atualizarHeaderUsuario = function(usuario) {
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    const userProfileImage = document.getElementById('userProfileImage');
    
    if (userNameElement) {
        userNameElement.textContent = usuario.nome_completo || usuario.nome || 'Usuário';
    }
    
    if (userRoleElement) {
        userRoleElement.textContent = usuario.tipo_perfil || 'Perfil';
    }
    
    if (userProfileImage && usuario.foto_perfil) {
        userProfileImage.src = usuario.foto_perfil;
    }
};