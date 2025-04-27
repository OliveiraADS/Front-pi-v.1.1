// =========================================================
// FUNÇÕES PARA ATUALIZAÇÃO DE PERFIL POR ID
// =========================================================

// Função para carregar a página de atualização de perfil de um usuário específico
window.carregarAtualizarPerfilById = async function(id) {
    try {
        console.log('Carregando página de atualização para o usuário ID:', id);
        
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
        
        // Armazenar temporariamente o ID do usuário para uso na página de edição
        localStorage.setItem('usuarioEditandoId', id);
        
        // Agora vamos carregar a página de edição de usuário
        const mainContent = document.querySelector('main');
        
        // Buscar o conteúdo HTML da página de atualização de perfil
        const htmlResponse = await fetch('atualiza-perfil.html');
        const html = await htmlResponse.text();
        
        // Extrair apenas o conteúdo dentro do container principal
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyContent = doc.querySelector('.atualizar-perfil-container');
        
        if (!bodyContent) {
            mainContent.innerHTML = '<p style="padding: 20px;">Erro ao carregar o formulário de edição de usuário.</p>';
            return;
        }
        
        // Atualizar o título da página
        const tituloElement = bodyContent.querySelector('.perfil-title');
        if (tituloElement) {
            tituloElement.textContent = 'Editar Usuário';
        }
        
        // Substituir o conteúdo atual do main pelo conteúdo da página de atualização
        mainContent.innerHTML = '';
        mainContent.appendChild(bodyContent.cloneNode(true));
        
        // Inicializar o formulário com os dados do usuário
        inicializarFormularioEdicaoUsuario(usuario);
        
    } catch (error) {
        console.error('Erro ao carregar página de atualização:', error);
        document.querySelector('main').innerHTML = '<p style="padding: 20px;">Erro ao carregar a página de atualização de perfil.</p>';
    }
};

// Função para inicializar o formulário de edição de usuário
function inicializarFormularioEdicaoUsuario(usuario) {
    // Referências aos elementos do formulário
    const form = document.getElementById('atualizarPerfilForm');
    const primeiroNomeInput = document.getElementById('primeiro_nome');
    const segundoNomeInput = document.getElementById('segundo_nome');
    const nomeCompletoInput = document.getElementById('nome_completo');
    const dataNascimentoInput = document.getElementById('data_nascimento');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');
    const tipoPerfilSelect = document.getElementById('tipo_perfil');
    const croUfInput = document.getElementById('cro_uf');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmar_senha');
    const voltarBtn = document.getElementById('voltarBtn');
    const deletarPerfilBtn = document.getElementById('deletarPerfilBtn');
    const mensagemDiv = document.getElementById('mensagem');
    
    // Preencher o formulário com os dados do usuário
    if (primeiroNomeInput) primeiroNomeInput.value = usuario.primeiro_nome || '';
    if (segundoNomeInput) segundoNomeInput.value = usuario.segundo_nome || '';
    if (nomeCompletoInput) nomeCompletoInput.value = usuario.nome_completo || usuario.nome || '';
    
    // Formatar a data de nascimento para o formato do input date (YYYY-MM-DD)
    if (dataNascimentoInput && usuario.data_nascimento) {
        const data = new Date(usuario.data_nascimento);
        const dataFormatada = data.toISOString().split('T')[0];
        dataNascimentoInput.value = dataFormatada;
    }
    
    if (emailInput) emailInput.value = usuario.email || '';
    if (telefoneInput) telefoneInput.value = usuario.telefone || '';
    
    // Selecionar o tipo de perfil atual no dropdown
    if (tipoPerfilSelect && usuario.tipo_perfil) {
        for (let i = 0; i < tipoPerfilSelect.options.length; i++) {
            if (tipoPerfilSelect.options[i].value === usuario.tipo_perfil) {
                tipoPerfilSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    if (croUfInput) croUfInput.value = usuario.cro_uf || '';
    
    // Mudar o texto do botão de excluir
    if (deletarPerfilBtn) {
        deletarPerfilBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Excluir Usuário';
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
    
    // Event listener para o botão "Voltar"
    if (voltarBtn) {
        voltarBtn.addEventListener('click', function() {
            // Voltar para a visualização do perfil
            const usuarioId = localStorage.getItem('usuarioEditandoId');
            if (usuarioId) {
                localStorage.removeItem('usuarioEditandoId');
                carregarPerfilUsuarioById(usuarioId);
            } else {
                // Se não tiver o ID, voltar para a listagem
                localStorage.removeItem('usuarioEditandoId');
                carregarListagemUsuarios();
            }
        });
    }
    
    // Event listener para o botão "Excluir"
    if (deletarPerfilBtn) {
        deletarPerfilBtn.addEventListener('click', async function() {
            // Confirmar a exclusão
            if (!confirm('ATENÇÃO: Esta ação não pode ser desfeita! Tem certeza que deseja excluir este usuário?')) {
                return;
            }
            
            const usuarioId = localStorage.getItem('usuarioEditandoId');
            if (!usuarioId) {
                mostrarMensagem('Erro: ID do usuário não encontrado', 'erro');
                return;
            }
            
            try {
                // Fazer a requisição para excluir o usuário
                const response = await fetch(`http://localhost:5000/api/usuarios/${usuarioId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Usuário excluído com sucesso
                    mostrarMensagem('Usuário excluído com sucesso!', 'sucesso');
                    
                    // Após 2 segundos, voltar para a listagem
                    setTimeout(function() {
                        localStorage.removeItem('usuarioEditandoId');
                        localStorage.removeItem('usuarioVisualizandoId');
                        carregarListagemUsuarios();
                    }, 2000);
                } else {
                    // Erro ao excluir o usuário
                    mostrarMensagem(data.mensagem || 'Erro ao excluir o usuário', 'erro');
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarMensagem('Erro ao conectar com o servidor', 'erro');
            }
        });
    }
    
    // Event listener para o formulário
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validar senhas
            if (senhaInput.value && senhaInput.value !== confirmarSenhaInput.value) {
                mostrarMensagem('As senhas não conferem. Por favor, verifique.', 'erro');
                return;
            }
            
            // Obter os dados do formulário
            const formData = {
                primeiro_nome: primeiroNomeInput.value,
                segundo_nome: segundoNomeInput.value,
                nome_completo: nomeCompletoInput.value,
                data_nascimento: dataNascimentoInput.value,
                email: emailInput.value,
                telefone: telefoneInput.value,
                tipo_perfil: tipoPerfilSelect.value,
                cro_uf: croUfInput.value
            };
            
            // Adicionar senha apenas se foi preenchida
            if (senhaInput.value) {
                formData.senha = senhaInput.value;
            }
            
            const usuarioId = localStorage.getItem('usuarioEditandoId');
            if (!usuarioId) {
                mostrarMensagem('Erro: ID do usuário não encontrado', 'erro');
                return;
            }
            
            try {
                // Fazer a requisição para atualizar o usuário
                const response = await fetch(`http://localhost:5000/api/usuarios/${usuarioId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Exibir mensagem de sucesso
                    mostrarMensagem('Usuário atualizado com sucesso!', 'sucesso');
                    
                    // Atualizar o usuário logado se for o seu próprio perfil
                    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioOdontoLegal')) || {};
                    if (usuarioLogado.id === usuarioId) {
                        const dadosAtualizados = {
                            ...usuarioLogado,
                            primeiro_nome: formData.primeiro_nome,
                            segundo_nome: formData.segundo_nome,
                            nome_completo: formData.nome_completo,
                            nome: formData.nome_completo,
                            email: formData.email,
                            telefone: formData.telefone,
                            tipo_perfil: formData.tipo_perfil,
                            cro_uf: formData.cro_uf
                        };
                        
                        localStorage.setItem('usuarioOdontoLegal', JSON.stringify(dadosAtualizados));
                        
                        // Atualizar elementos do header
                        const userNameElement = document.getElementById('userName');
                        if (userNameElement) {
                            userNameElement.textContent = dadosAtualizados.nome_completo;
                        }
                        
                        const userRoleElement = document.getElementById('userRole');
                        if (userRoleElement) {
                            userRoleElement.textContent = dadosAtualizados.tipo_perfil;
                        }
                    }
                    
                    // Após 2 segundos, voltar para o perfil do usuário
                    setTimeout(function() {
                        // Manter o ID para visualização do perfil
                        localStorage.removeItem('usuarioEditandoId');
                        carregarPerfilUsuarioById(usuarioId);
                    }, 2000);
                } else {
                    // Erro na atualização
                    mostrarMensagem(data.mensagem || 'Erro ao atualizar o usuário. Por favor, tente novamente.', 'erro');
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarMensagem('Erro de conexão. Tente novamente mais tarde.', 'erro');
            }
        });
    }
}