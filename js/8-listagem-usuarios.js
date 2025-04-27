// =========================================================
// FUNÇÕES PARA LISTAGEM DE USUÁRIOS
// =========================================================

// Função para carregar a página de listagem de usuários dentro do main
window.carregarListagemUsuarios = async function() {
    try {
        // Obter referência ao conteúdo principal da página
        const mainContent = document.querySelector('main');
        
        // Criar o HTML para a listagem de usuários diretamente
        mainContent.innerHTML = `
            <div class="usuarios-container">
                <h2 class="usuarios-title">Listagem de Usuários</h2>
                
                <div class="usuarios-header">
                    <div class="nome">NOME COMPLETO</div>
                    <div class="email">EMAIL</div>
                    <div class="tipo">TIPO DE PERFIL</div>
                    <div class="cro">CRO/UF</div>
                    <div class="data">DATA DE CRIAÇÃO</div>
                </div>
                
                <div id="usuarios-lista">
                    <!-- Os usuários serão inseridos aqui através do JavaScript -->
                    <div class="no-usuarios">Carregando usuários...</div>
                </div>
            </div>
        `;
        
        // Carregar os usuários
        carregarUsuarios();
    } catch (error) {
        console.error('Erro ao carregar a página de listagem de usuários:', error);
        document.querySelector('main').innerHTML = '<p style="padding: 20px;">Erro ao carregar a listagem de usuários.</p>';
    }
};

// Função para buscar os usuários da API
async function carregarUsuarios() {
    try {
        // Fazer a requisição para a API
        const response = await fetch('http://localhost:5000/api/usuarios');
        
        if (!response.ok) {
            throw new Error('Erro ao carregar os usuários');
        }
        
        const data = await response.json();
        // Verificar se temos dados e se temos a propriedade "dados" ou "data"
        const usuarios = data.dados || data.data || [];
        
        const usuariosListaElement = document.getElementById('usuarios-lista');
        
        if (!usuariosListaElement) {
            console.error('Elemento #usuarios-lista não encontrado');
            return;
        }
        
        if (usuarios.length === 0) {
            usuariosListaElement.innerHTML = '<div class="no-usuarios">Nenhum usuário encontrado</div>';
            return;
        }
        
        // Limpar a lista
        usuariosListaElement.innerHTML = '';
        
        // Adicionar cada usuário à lista
        usuarios.forEach(usuario => {
            const usuarioElement = document.createElement('div');
            usuarioElement.className = 'usuario-item';
            // Adicionar o ID do usuário como atributo de dados
            usuarioElement.setAttribute('data-id', usuario.id || usuario._id);
            // Adicionar cursor de ponteiro para indicar que é clicável
            usuarioElement.style.cursor = 'pointer';
            
            // Formatar a data de criação
            const dataCriacao = formatarData(usuario.data_criacao);
            
            // Construir o HTML para cada item de usuário
            usuarioElement.innerHTML = `
                <div class="nome">${usuario.nome_completo || 'N/A'}</div>
                <div class="email">${usuario.email || 'N/A'}</div>
                <div class="tipo">${usuario.tipo_perfil || 'N/A'}</div>
                <div class="cro">${usuario.cro_uf || 'N/A'}</div>
                <div class="data">${dataCriacao}</div>
            `;
            
            // Adicionar evento de clique para abrir perfil do usuário
            usuarioElement.addEventListener('click', function() {
                const usuarioId = this.getAttribute('data-id');
                carregarPerfilUsuarioById(usuarioId);
            });
            
            usuariosListaElement.appendChild(usuarioElement);
        });
        
    } catch (error) {
        console.error('Erro:', error);
        const usuariosListaElement = document.getElementById('usuarios-lista');
        if (usuariosListaElement) {
            usuariosListaElement.innerHTML = 
                '<div class="no-usuarios">Erro ao carregar os usuários. Por favor, tente novamente mais tarde.</div>';
        }
    }
}