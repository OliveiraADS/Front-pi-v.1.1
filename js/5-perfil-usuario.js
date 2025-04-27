// =========================================================
// FUNÇÕES DE GERENCIAMENTO DE PERFIL DO USUÁRIO
// =========================================================

// Função para carregar a página de perfil
window.carregarPerfilUsuario = async function() {
    try {
        const mainContent = document.querySelector('main');
        // Buscar o conteúdo HTML da página de perfil
        const response = await fetch('perfil.html');
        const html = await response.text();
        
        // Extrair apenas o conteúdo dentro do container principal
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyContent = doc.querySelector('.perfil-container');
        
        if (!bodyContent) {
            mainContent.innerHTML = '<p style="padding: 20px;">Erro ao carregar o perfil.</p>';
            return;
        }
        
        // Substituir o conteúdo atual do main pelo conteúdo da página de perfil
        mainContent.innerHTML = '';
        mainContent.appendChild(bodyContent.cloneNode(true));
        
        // Inicializar a página de perfil manualmente
        inicializarPaginaPerfil();
    } catch (error) {
        console.error('Erro ao carregar a página de perfil:', error);
        document.querySelector('main').innerHTML = '<p style="padding: 20px;">Erro ao carregar o perfil.</p>';
    }
};

// Função para inicializar a página de perfil
function inicializarPaginaPerfil() {
    // Verificar se o usuário está logado
    const usuarioData = localStorage.getItem('usuarioOdontoLegal');
    if (!usuarioData) {
        window.location.href = 'login.html';
        return;
    }
    
    // Converter dados do JSON para objeto
    const usuario = JSON.parse(usuarioData);
    console.log('Usuário logado:', usuario);
    
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
    
    // Adicionar event listener para o botão "Atualizar Perfil"
    const btnAtualizarPerfil = document.getElementById('btnAtualizarPerfil');
    if (btnAtualizarPerfil) {
        btnAtualizarPerfil.addEventListener('click', function(e) {
            e.preventDefault();
            carregarAtualizarPerfil();
        });
    }
    
    // Referências aos contadores de casos
    const casosEmAndamentoSpan = document.getElementById('casosEmAndamento');
    const casosFinalizadosSpan = document.getElementById('casosFinalizados');
    const casosArquivadosSpan = document.getElementById('casosArquivados');
    
    // Preencher os dados do perfil
    if (perfilPrimeiroNome) perfilPrimeiroNome.textContent = usuario.primeiro_nome || 'Não informado';
    if (perfilSegundoNome) perfilSegundoNome.textContent = usuario.segundo_nome || 'Não informado';
    if (perfilNomeCompleto) perfilNomeCompleto.textContent = usuario.nome_completo || usuario.nome || 'Não informado';
    if (perfilEmail) perfilEmail.textContent = usuario.email || 'Email não disponível';
    if (perfilTelefone) perfilTelefone.textContent = usuario.telefone || 'Não informado';
    if (perfilTipo) perfilTipo.textContent = usuario.tipo_perfil || 'Tipo não disponível';
    if (perfilCroUf) perfilCroUf.textContent = usuario.cro_uf || 'Não informado';
    // Preencher os dados do perfil
    if (perfilPrimeiroNome) perfilPrimeiroNome.textContent = usuario.primeiro_nome || 'Não informado';
    if (perfilSegundoNome) perfilSegundoNome.textContent = usuario.segundo_nome || 'Não informado';
    // ... outros preenchimentos de dados ...

    // Aplicar as permissões APÓS preencher os dados e ANTES de carregar a contagem de casos
    if (typeof window.verificarPermissoesElementos === 'function') {
    window.verificarPermissoesElementos();
    } else {
    console.error('Função verificarPermissoesElementos não encontrada');
    
    // Fallback: aplicar permissões manualmente para o botão de atualizar perfil
    const btnAtualizarPerfil = document.getElementById('btnAtualizarPerfil');
    if (btnAtualizarPerfil) {
        btnAtualizarPerfil.style.display = usuario.tipo_perfil === 'Admin' ? '' : 'none';
    }
    }
    
    // Carregar a imagem de perfil, se disponível
    if (perfilImagem && usuario.foto_perfil) {
        perfilImagem.src = usuario.foto_perfil;
    }
    
    // Carregar contagem de casos por status
    carregarContagemCasos();
    
    // Função para carregar a contagem de casos por status
    async function carregarContagemCasos() {
        try {
            // Verificar se temos o ID do usuário
            if (!usuario || !usuario.id) {
                console.error('ID de usuário não encontrado no localStorage');
                return;
            }
            
            console.log('Carregando contagem de casos para o usuário ID:', usuario.id);
            
            // Buscar casos "Em andamento"
            const responseEmAndamento = await fetch(
                `http://localhost:5000/api/casos/responsavel/${usuario.id}/status/Em andamento`
            );
            
            // Buscar casos "Finalizado"
            const responseFinalizado = await fetch(
                `http://localhost:5000/api/casos/responsavel/${usuario.id}/status/Finalizado`
            );
            
            // Buscar casos "Arquivado"
            const responseArquivado = await fetch(
                `http://localhost:5000/api/casos/responsavel/${usuario.id}/status/Arquivado`
            );
            
            // Processar os dados e atualizar a interface
            if (responseEmAndamento.ok) {
                const dataEmAndamento = await responseEmAndamento.json();
                console.log('Casos em andamento:', dataEmAndamento);
                if (casosEmAndamentoSpan) {
                    casosEmAndamentoSpan.textContent = dataEmAndamento.data.length || '0';
                }
            }
            
            if (responseFinalizado.ok) {
                const dataFinalizado = await responseFinalizado.json();
                console.log('Casos finalizados:', dataFinalizado);
                if (casosFinalizadosSpan) {
                    casosFinalizadosSpan.textContent = dataFinalizado.data.length || '0';
                }
            }
            
            if (responseArquivado.ok) {
                const dataArquivado = await responseArquivado.json();
                console.log('Casos arquivados:', dataArquivado);
                if (casosArquivadosSpan) {
                    casosArquivadosSpan.textContent = dataArquivado.data.length || '0';
                }
            }
            
        } catch (error) {
            console.error('Erro ao carregar contagem de casos:', error);
            
            // Em caso de erro, manter os contadores em 0
            if (casosEmAndamentoSpan) casosEmAndamentoSpan.textContent = '0';
            if (casosFinalizadosSpan) casosFinalizadosSpan.textContent = '0';
            if (casosArquivadosSpan) casosArquivadosSpan.textContent = '0';
        }
    }
    
    // Evento para quando o usuário selecionar uma imagem
    if (uploadInput) {
        uploadInput.addEventListener('change', function(e) {
            const arquivo = e.target.files[0];
            
            if (!arquivo) {
                return;
            }
            
            // Verificar se é uma imagem
            if (!arquivo.type.match('image.*')) {
                mostrarMensagem(mensagemDiv, 'Por favor, selecione uma imagem válida.', 'erro');
                return;
            }
            
            // Verificar tamanho (limite de 5MB)
            if (arquivo.size > 5 * 1024 * 1024) {
                mostrarMensagem(mensagemDiv, 'A imagem deve ter menos de 5MB.', 'erro');
                return;
            }
            
            // Ler arquivo e converter para Base64
            const leitor = new FileReader();
            leitor.readAsDataURL(arquivo);
            
            leitor.onload = async function() {
                const base64String = leitor.result;
                
                // Pré-visualização da imagem
                if (perfilImagem) {
                    perfilImagem.src = base64String;
                }
                
                // Enviar para a API
                try {
                    const response = await fetch(`http://localhost:5000/api/usuarios/${usuario.id}/foto`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ foto_base64: base64String })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        mostrarMensagem(mensagemDiv, 'Foto de perfil atualizada com sucesso!', 'sucesso');
                        
                        // Atualizar dados no localStorage
                        const dadosAtualizados = {
                            ...usuario,
                            foto_perfil: data.dados.foto_perfil
                        };
                        
                        localStorage.setItem('usuarioOdontoLegal', JSON.stringify(dadosAtualizados));
                        
                        // Atualizar a imagem no header
                        const headerImage = document.getElementById('userProfileImage');
                        if (headerImage) {
                            headerImage.src = data.dados.foto_perfil;
                        }
                    } else {
                        // Erro na atualização
                        mostrarMensagem(mensagemDiv, data.mensagem || 'Erro ao atualizar foto de perfil', 'erro');
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    mostrarMensagem(mensagemDiv, 'Erro de conexão. Tente novamente mais tarde.', 'erro');
                }
            };
            
            leitor.onerror = function() {
                mostrarMensagem(mensagemDiv, 'Erro ao processar a imagem selecionada.', 'erro');
            };
        });
    }
}