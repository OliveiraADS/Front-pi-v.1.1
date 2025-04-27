// =========================================================
// FUNÇÕES PARA ATUALIZAÇÃO DE PERFIL
// =========================================================

// Função para carregar a página de atualização de perfil
window.carregarAtualizarPerfil = async function() {
    try {
        console.log('Carregando página de atualização de perfil...');
        const mainContent = document.querySelector('main');
        
        // Buscar o conteúdo HTML da página de atualização de perfil
        const response = await fetch('atualiza-perfil.html');
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar atualiza-perfil.html: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        
        // Extrair apenas o conteúdo dentro do container principal
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyContent = doc.querySelector('.atualizar-perfil-container');
        
        if (!bodyContent) {
            console.error('Elemento .atualizar-perfil-container não encontrado no HTML');
            mainContent.innerHTML = '<p style="padding: 20px;">Erro ao carregar a página de atualização de perfil.</p>';
            return;
        }
        
        // Substituir o conteúdo atual do main pelo conteúdo da página de atualização
        mainContent.innerHTML = '';
        mainContent.appendChild(bodyContent.cloneNode(true));
        
        // Inicializar a página de atualização manualmente
        inicializarPaginaAtualizarPerfil();
        
    } catch (error) {
        console.error('Erro ao carregar a página de atualização de perfil:', error);
        document.querySelector('main').innerHTML = '<p style="padding: 20px;">Erro ao carregar a página de atualização de perfil.</p>';
    }
};

// Função para inicializar a página de atualização de perfil
function inicializarPaginaAtualizarPerfil() {
    console.log('Inicializando página de atualização de perfil...');
    
    // Verificar se o usuário está logado
    const usuarioData = localStorage.getItem('usuarioOdontoLegal');
    if (!usuarioData) {
        window.location.href = 'login.html';
        return;
    }
    
    // Converter dados do JSON para objeto
    const usuario = JSON.parse(usuarioData);
    
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
    
    console.log('Elementos do formulário obtidos');
    
    // Preencher o formulário com os dados atuais do usuário
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
    
    console.log('Formulário preenchido com dados do usuário');
    
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
            console.log('Botão Voltar clicado');
            // Voltar para a página de perfil
            carregarPerfilUsuario();
        });
    }
    
    // Event listener para o botão "Excluir Perfil"
    if (deletarPerfilBtn) {
        deletarPerfilBtn.addEventListener('click', async function() {
            console.log('Botão Excluir Perfil clicado');
            // Confirmar a exclusão
            if (!confirm('ATENÇÃO: Esta ação não pode ser desfeita! Tem certeza que deseja excluir seu perfil permanentemente?')) {
                return;
            }
            
            // Pedir a senha para confirmar a exclusão
            const senhaConfirmacao = prompt('Por favor, digite sua senha para confirmar a exclusão:');
            if (!senhaConfirmacao) {
                return; // Usuário cancelou a operação
            }
            
            try {
                // Fazer a requisição para excluir o perfil
                const response = await fetch(`http://localhost:5000/api/usuarios/${usuario.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ senha: senhaConfirmacao })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Perfil excluído com sucesso
                    alert('Seu perfil foi excluído com sucesso. Você será redirecionado para a página de login.');
                    
                    // Limpar dados do localStorage
                    localStorage.removeItem('usuarioOdontoLegal');
                    
                    // Redirecionar para a página de login
                    window.location.href = 'login.html';
                } else {
                    // Erro ao excluir o perfil
                    mostrarMensagem(data.mensagem || 'Erro ao excluir o perfil. Verifique sua senha e tente novamente.', 'erro');
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarMensagem('Erro de conexão. Tente novamente mais tarde.', 'erro');
            }
        });
    }
    
    // Event listener para o formulário
    if (form) {
        form.addEventListener('submit', async function(e) {
            console.log('Formulário submetido');
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
            
            try {
                // Fazer a requisição para atualizar o perfil
                const response = await fetch(`http://localhost:5000/api/usuarios/${usuario.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Atualizar dados no localStorage
                    const dadosAtualizados = {
                        ...usuario,
                        primeiro_nome: formData.primeiro_nome,
                        segundo_nome: formData.segundo_nome,
                        nome_completo: formData.nome_completo,
                        nome: formData.nome_completo, // Para compatibilidade
                        email: formData.email,
                        telefone: formData.telefone,
                        tipo_perfil: formData.tipo_perfil,
                        cro_uf: formData.cro_uf
                    };
                    
                    localStorage.setItem('usuarioOdontoLegal', JSON.stringify(dadosAtualizados));
                    
                    // Exibir mensagem de sucesso
                    mostrarMensagem('Perfil atualizado com sucesso!', 'sucesso');
                    
                    // Atualizar o nome no header
                    const userNameElement = document.getElementById('userName');
                    if (userNameElement) {
                        userNameElement.textContent = dadosAtualizados.nome_completo;
                    }
                    
                    // Atualizar o tipo de perfil no header
                    const userRoleElement = document.getElementById('userRole');
                    if (userRoleElement) {
                        userRoleElement.textContent = dadosAtualizados.tipo_perfil;
                    }
                    
                    // Após 2 segundos, redirecionar para a página de perfil
                    setTimeout(function() {
                        carregarPerfilUsuario();
                    }, 2000);
                } else {
                    // Erro na atualização
                    mostrarMensagem(data.mensagem || 'Erro ao atualizar o perfil. Por favor, tente novamente.', 'erro');
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarMensagem('Erro de conexão. Tente novamente mais tarde.', 'erro');
            }
        });
    }
    
    console.log('Inicialização da página de atualização de perfil concluída');
}