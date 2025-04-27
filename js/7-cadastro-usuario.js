// =========================================================
// FUNÇÕES PARA CADASTRO DE USUÁRIO
// =========================================================

// Função para carregar a página de cadastro de usuário
window.carregarCadastroUsuario = async function() {
    try {
        const mainContent = document.querySelector('main');
        
        // Buscar o conteúdo HTML da página de cadastro de usuário
        const response = await fetch('cadastrar-usuario.html');
        const html = await response.text();
        
        // Extrair apenas o conteúdo dentro do container principal
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyContent = doc.querySelector('.atualizar-perfil-container');
        
        if (!bodyContent) {
            mainContent.innerHTML = '<p style="padding: 20px;">Erro ao carregar a página de cadastro de usuário.</p>';
            return;
        }
        
        // Substituir o conteúdo atual do main pelo conteúdo da página de cadastro
        mainContent.innerHTML = '';
        mainContent.appendChild(bodyContent.cloneNode(true));
        
        // Inicializar o formulário diretamente em vez de carregar o script externo
        inicializarCadastroUsuario();
    } catch (error) {
        console.error('Erro ao carregar a página de cadastro de usuário:', error);
        document.querySelector('main').innerHTML = '<p style="padding: 20px;">Erro ao carregar a página de cadastro de usuário.</p>';
    }
};

// Função para inicializar o formulário de cadastro de usuário
function inicializarCadastroUsuario() {
    // Verificar se o usuário está logado
    const usuarioData = localStorage.getItem('usuarioOdontoLegal');
    if (!usuarioData) {
        window.location.href = 'login.html';
        return;
    }
    
    // Converter dados do JSON para objeto
    const usuarioLogado = JSON.parse(usuarioData);
    
    // Verificar se o usuário tem permissão (apenas Admin)
    if (usuarioLogado.tipo_perfil !== 'Admin') {
        alert('Você não tem permissão para acessar esta página.');
        window.location.href = 'home.html';
        return;
    }
    
    // Referências aos elementos do formulário
    const form = document.getElementById('cadastrarUsuarioForm');
    const primeiroNomeInput = document.getElementById('primeiro_nome');
    const segundoNomeInput = document.getElementById('segundo_nome');
    const nomeCompletoInput = document.getElementById('nome_completo');
    const dataNascimentoInput = document.getElementById('data_nascimento');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmar_senha');
    const telefoneInput = document.getElementById('telefone');
    const tipoPerfilSelect = document.getElementById('tipo_perfil');
    const croUfInput = document.getElementById('cro_uf');
    const cancelarBtn = document.getElementById('cancelarBtn');
    const mensagemDiv = document.getElementById('mensagem');
    
    console.log('Formulário inicializado:', {
        form: !!form,
        mensagemDiv: !!mensagemDiv,
        cancelarBtn: !!cancelarBtn
    });
    
    // Definir a data atual como valor padrão
    if (dataNascimentoInput) {
        const hoje = new Date();
        const dataFormatada = hoje.toISOString().split('T')[0];
        dataNascimentoInput.value = dataFormatada;
    }
    
    // Função para mostrar mensagens
    function mostrarMensagem(texto, tipo) {
        if (!mensagemDiv) {
            console.error('Elemento mensagemDiv não encontrado');
            return;
        }
        
        console.log('Mostrando mensagem:', { texto, tipo });
        
        mensagemDiv.textContent = texto;
        mensagemDiv.className = `mensagem ${tipo}`;
        mensagemDiv.style.display = 'block';
        
        // Não ocultar a mensagem de sucesso automaticamente, pois vamos redirecionar
        if (tipo !== 'sucesso') {
            // Ocultar a mensagem após 5 segundos se não for sucesso
            setTimeout(() => {
                mensagemDiv.style.display = 'none';
            }, 5000);
        }
    }
    
    // Event listener para o botão "Cancelar"
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', function() {
            console.log('Botão Cancelar clicado');
            // Voltar para a listagem de usuários
            if (typeof window.carregarListagemUsuarios === 'function') {
                window.carregarListagemUsuarios();
            } else {
                console.error('Função carregarListagemUsuarios não encontrada');
                // Caso a função não esteja disponível, voltar para a página inicial
                document.querySelector('main').innerHTML = '<p style="padding: 20px;">Conteúdo aqui futuramente...</p>';
            }
        });
    }
    
    // Event listener para o formulário
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Formulário submetido');
            
            // Validar senhas
            if (senhaInput.value !== confirmarSenhaInput.value) {
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
                senha: senhaInput.value,
                telefone: telefoneInput.value || '',
                tipo_perfil: tipoPerfilSelect.value,
                cro_uf: croUfInput.value || ''
            };
            
            console.log('Dados do formulário:', formData);
            
            try {
                console.log('Enviando requisição para a API...');
                // Fazer a requisição para criar o usuário
                const response = await fetch('http://localhost:5000/api/usuarios', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log('Resposta da API:', {
                    status: response.status,
                    ok: response.ok
                });
                
                const data = await response.json();
                console.log('Dados da resposta:', data);
                
                if (response.ok) {
                    // Cadastro realizado com sucesso
                    mostrarMensagem('Usuário cadastrado com sucesso!', 'sucesso');
                    
                    // Desabilitar o botão de envio para evitar cliques repetidos
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.disabled = true;
                    }
                    
                    // Após 2 segundos, redirecionar para a listagem de usuários
                    setTimeout(function() {
                        console.log('Redirecionando para a listagem de usuários...');
                        if (typeof window.carregarListagemUsuarios === 'function') {
                            window.carregarListagemUsuarios();
                        } else {
                            console.error('Função carregarListagemUsuarios não encontrada');
                            // Caso a função não esteja disponível, voltar para a página inicial
                            document.querySelector('main').innerHTML = '<p style="padding: 20px;">Conteúdo aqui futuramente...</p>';
                        }
                    }, 2000);
                } else {
                    // Erro no cadastro
                    mostrarMensagem(data.mensagem || 'Erro ao cadastrar o usuário. Por favor, tente novamente.', 'erro');
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
                mostrarMensagem('Erro de conexão. Tente novamente mais tarde.', 'erro');
            }
        });
    } else {
        console.error('Formulário não encontrado');
    }
}