// =========================================================
// FUNÇÕES PARA VISUALIZAÇÃO DE PERFIL DE USUÁRIO POR ID
// =========================================================

// Nova função para carregar o perfil de um usuário específico
window.carregarPerfilUsuarioById = async function(id) {
    try {
        console.log('Carregando perfil do usuário ID:', id);
        
        // Guardar o ID do usuário que está sendo visualizado
        localStorage.setItem('usuarioVisualizandoId', id);
        
        // Buscar os dados do usuário da API
        const response = await fetch(`http://localhost:5000/api/usuarios/${id}`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar os dados do usuário');
        }
        
        const data = await response.json();
        const usuario = data.dados || data.data;
        
        if (!usuario) {
            throw new Error('Dados do usuário não encontrados');
        }
        
        // Agora vamos carregar a página de perfil
        const mainContent = document.querySelector('main');
        
        // Buscar o conteúdo HTML da página de perfil
        const htmlResponse = await fetch('perfil.html');
        const html = await htmlResponse.text();
        
        // Extrair apenas o conteúdo dentro do container principal
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyContent = doc.querySelector('.perfil-container');
        
        if (!bodyContent) {
            mainContent.innerHTML = '<p style="padding: 20px;">Erro ao carregar o perfil do usuário.</p>';
            return;
        }
        
        // Atualizar o título da página
        const tituloElement = bodyContent.querySelector('.perfil-title');
        if (tituloElement) {
            tituloElement.textContent = 'Perfil do Usuário';
        }
        
        // Substituir o conteúdo atual do main pelo conteúdo da página de perfil
        mainContent.innerHTML = '';
        mainContent.appendChild(bodyContent.cloneNode(true));
        
        // Inicializar a página de perfil com os dados do usuário específico
        inicializarPerfilUsuarioById(usuario);
        
    } catch (error) {
        console.error('Erro ao carregar perfil do usuário:', error);
        document.querySelector('main').innerHTML = '<p style="padding: 20px;">Erro ao carregar o perfil do usuário.</p>';
    }
};

// Função para inicializar os dados do perfil de um usuário específico
function inicializarPerfilUsuarioById(usuario) {
    console.log('Inicializando perfil para o usuário:', usuario);
    
    // Referências aos elementos da página
    const perfilImagem = document.getElementById('perfilImagem');
    const perfilPrimeiroNome = document.getElementById('perfilPrimeiroNome');
    const perfilSegundoNome = document.getElementById('perfilSegundoNome');
    const perfilNomeCompleto = document.getElementById('perfilNomeCompleto');
    const perfilEmail = document.getElementById('perfilEmail');
    const perfilTelefone = document.getElementById('perfilTelefone');
    const perfilTipo = document.getElementById('perfilTipo');
    const perfilCroUf = document.getElementById('perfilCroUf');
    const uploadInput = document.getElementById('uploadImagem');
    const mensagemDiv = document.getElementById('mensagem');
    const btnAtualizarPerfil = document.getElementById('btnAtualizarPerfil');
    
    // Referências aos contadores de casos (ocultar se não for o perfil do usuário logado)
    const casosCards = document.querySelector('.casos-cards');
    if (casosCards) {
        casosCards.style.display = 'none'; // Ocultar os cards de casos para perfis de outros usuários
    }
    
    // Preencher os dados do perfil
    if (perfilPrimeiroNome) perfilPrimeiroNome.textContent = usuario.primeiro_nome || 'Não informado';
    if (perfilSegundoNome) perfilSegundoNome.textContent = usuario.segundo_nome || 'Não informado';
    if (perfilNomeCompleto) perfilNomeCompleto.textContent = usuario.nome_completo || 'Não informado';
    if (perfilEmail) perfilEmail.textContent = usuario.email || 'Email não disponível';
    if (perfilTelefone) perfilTelefone.textContent = usuario.telefone || 'Não informado';
    if (perfilTipo) perfilTipo.textContent = usuario.tipo_perfil || 'Tipo não disponível';
    if (perfilCroUf) perfilCroUf.textContent = usuario.cro_uf || 'Não informado';
    
    // Carregar a imagem de perfil, se disponível
    if (perfilImagem) {
        // IMPORTANTE: Verificar os diversos nomes possíveis para o campo de foto de perfil
        // Isso resolve a inconsistência entre o campo no banco de dados e o retorno da API
        const fotoPerfil = usuario.foto_perfil || usuario.foto_perfil_usuario || null;
        
        if (fotoPerfil) {
            console.log('Foto do perfil encontrada');
            perfilImagem.src = fotoPerfil;
        } else {
            console.log('Usuário não tem foto de perfil, usando placeholder');
            perfilImagem.src = 'img/foto_perfil.jpg';
        }
    } else {
        console.error('Elemento perfilImagem não encontrado');
    }
    
    // Função para mostrar mensagens
    function mostrarMensagem(texto, tipo) {
        if (!mensagemDiv) return;
        
        mensagemDiv.textContent = texto;
        mensagemDiv.className = `mensagem ${tipo}`;
        mensagemDiv.style.display = 'block';
        
        // Ocultar a mensagem após 5 segundos
        setTimeout(() => {
            mensagemDiv.style.display = 'none';
        }, 5000);
    }
    
    // Desativar a funcionalidade de upload de imagem para perfis de outros usuários
    if (uploadInput) {
        const uploadWrapper = uploadInput.parentElement;
        if (uploadWrapper) {
            const uploadLabel = uploadWrapper.querySelector('label');
            if (uploadLabel) {
                uploadLabel.style.display = 'none'; // Ocultar o botão de upload
            }
        }
    }
    
    // Adicionar event listener para o botão "Atualizar Perfil"
    if (btnAtualizarPerfil) {
        btnAtualizarPerfil.addEventListener('click', function(e) {
            e.preventDefault();
            // Usar o ID armazenado no localStorage
            const usuarioId = localStorage.getItem('usuarioVisualizandoId');
            if (usuarioId) {
                carregarAtualizarPerfilById(usuarioId);
            } else {
                console.error('ID do usuário não encontrado para atualização');
                mostrarMensagem('Erro ao tentar atualizar o perfil: ID não encontrado', 'erro');
            }
        });
    }
}