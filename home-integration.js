// =========================================================
// FUNÇÕES BÁSICAS DE INICIALIZAÇÃO E NAVEGAÇÃO
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
    // Referências para os elementos de navegação
    const casosHeaderLink = document.querySelector('.nav-links a:first-child');
    const listagemCasosLink = document.querySelector('.sidebar-item:first-child');
    const novoCasoLink = document.querySelector('.sidebar-item:nth-child(2)');
    const mainContent = document.querySelector('main');
    
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
        userInfoElement.addEventListener('click', function() {
            carregarPerfilUsuario();
        });
    }
});

// ------------------------------------------------------------------------------------------------------------

// =========================================================
// VERIFICAÇÃO DE PERMISSÕES DO USUÁRIO
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
    }
}

// ------------------------------------------------------------------------------------------------------------

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

// ------------------------------------------------------------------------------------------------------------

// =========================================================
// FUNÇÕES DE GERENCIAMENTO DE CASOS
// =========================================================

// Função para carregar a página de listagem de casos dentro do main
window.carregarListagemCasos = async function() {
    try {
        const mainContent = document.querySelector('main');
        // Buscar o conteúdo HTML da página listagem-caso.html
        const response = await fetch('listagem-caso.html');
        const html = await response.text();
        
        // Extrair apenas o conteúdo dentro do container principal
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyContent = doc.querySelector('.casos-container');
        
        if (!bodyContent) {
            mainContent.innerHTML = '<p style="padding: 20px;">Erro ao carregar a listagem de casos.</p>';
            return;
        }
        
        // Substituir o conteúdo atual do main pelo conteúdo da página de listagem
        mainContent.innerHTML = '';
        mainContent.appendChild(bodyContent.cloneNode(true));
        
        // Carregar os casos
        carregarCasos();
    } catch (error) {
        console.error('Erro ao carregar a página de listagem:', error);
        document.querySelector('main').innerHTML = '<p style="padding: 20px;">Erro ao carregar a listagem de casos.</p>';
    }
};

// Função para carregar a página de novo caso dentro do main
async function carregarNovoCaso() {
    try {
        const mainContent = document.querySelector('main');
        // Buscar o conteúdo HTML da página novo-caso.html
        const response = await fetch('novo-caso.html');
        const html = await response.text();
        
        // Extrair apenas o conteúdo dentro do container principal
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyContent = doc.querySelector('.novo-caso-container');
        
        if (!bodyContent) {
            mainContent.innerHTML = '<p style="padding: 20px;">Erro ao carregar o formulário de novo caso.</p>';
            return;
        }
        
        // Substituir o conteúdo atual do main pelo conteúdo da página de novo caso
        mainContent.innerHTML = '';
        mainContent.appendChild(bodyContent.cloneNode(true));
        
        // Inicializar o formulário
        inicializarFormulario();
    } catch (error) {
        console.error('Erro ao carregar a página de novo caso:', error);
        document.querySelector('main').innerHTML = '<p style="padding: 20px;">Erro ao carregar o formulário de novo caso.</p>';
    }
}

// Função para buscar os casos da API e torná-los clicáveis
async function carregarCasos() {
    try {
        // Carregar mapa de IDs dos peritos para seus nomes
        const peritosMap = new Map();
        try {
            const peritosResponse = await fetch('http://localhost:5000/api/usuarios/tipo/Perito');
            if (peritosResponse.ok) {
                const peritos = await peritosResponse.json();
                peritos.forEach(perito => {
                    const id = perito.id || perito._id;
                    const nome = perito.nome || perito.nome_completo || perito.name;
                    peritosMap.set(id, nome);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar mapa de peritos:', error);
        }
        
        // Carregar casos
        const response = await fetch('http://localhost:5000/api/casos');
        
        if (!response.ok) {
            throw new Error('Erro ao carregar os casos');
        }
        
        const data = await response.json();
        const casos = data.data || [];
        
        const casosListaElement = document.getElementById('casos-lista');
        
        if (!casosListaElement) {
            console.error('Elemento #casos-lista não encontrado');
            return;
        }
        
        if (casos.length === 0) {
            casosListaElement.innerHTML = '<div class="no-casos">Nenhum caso encontrado</div>';
            return;
        }
        
        // Limpar a lista
        casosListaElement.innerHTML = '';
        
        // Adicionar cada caso à lista
        casos.forEach(caso => {
            const casoElement = document.createElement('div');
            casoElement.className = 'caso-item';
            casoElement.setAttribute('data-id', caso.id_caso);
            
            // Verificar se temos o nome do perito no mapa
            let nomeResponsavel = caso.responsavel_caso;
            if (peritosMap.has(caso.responsavel_caso)) {
                nomeResponsavel = peritosMap.get(caso.responsavel_caso);
            }
            
            casoElement.innerHTML = `
                <div class="id">${caso.id_caso}</div>
                <div class="titulo">${caso.titulo_caso}</div>
                <div class="data">${formatarData(caso.data_abertura_caso)}</div>
                <div class="responsavel">${nomeResponsavel}</div>
                <div class="status">
                    <span class="status-badge ${getStatusClass(caso.status_caso)}">
                        ${caso.status_caso}
                    </span>
                </div>
            `;
            
            // Adicionar evento de clique para abrir detalhes
            casoElement.addEventListener('click', function() {
                carregarDetalhesCaso(caso.id_caso);
            });
            
            casosListaElement.appendChild(casoElement);
        });
        
    } catch (error) {
        console.error('Erro:', error);
        const casosListaElement = document.getElementById('casos-lista');
        if (casosListaElement) {
            casosListaElement.innerHTML = 
                '<div class="no-casos">Erro ao carregar os casos. Por favor, tente novamente mais tarde.</div>';
        }
    }
}

// ------------------------------------------------------------------------------------------------------------


// =========================================================
// INICIALIZAÇÃO E MANIPULAÇÃO DE FORMULÁRIO DE CASOS
// =========================================================

// Função para inicializar o formulário após carregamento dinâmico
function inicializarFormulario() {
    // Definir a data de hoje como valor padrão para o campo de data
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    const dataInput = document.getElementById('data_abertura_caso');
    if (dataInput) {
        dataInput.value = dataFormatada;
    }
    
    // Carregar os peritos para o select
    const selectPeritos = document.getElementById('responsavel_caso');
    if (selectPeritos) {
        carregarPeritos();
    }
    
    // Função para carregar a lista de peritos da API
    async function carregarPeritos() {
        try {
            console.log('Iniciando carregamento de peritos...');
            
            // Fazer requisição para a API que retorna apenas os peritos
            const response = await fetch('http://localhost:5000/api/usuarios/tipo/Perito');
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar peritos: ${response.status} ${response.statusText}`);
            }
            
            const peritos = await response.json();
            console.log('Peritos carregados:', peritos);
            
            // Limpar o select antes de adicionar novas opções
            selectPeritos.innerHTML = '<option value="">Selecione um perito</option>';
            
            // Adicionar cada perito como uma opção no select
            peritos.forEach(perito => {
                const option = document.createElement('option');
                // Definimos o valor da option como o ID do perito (será enviado ao backend)
                option.value = perito.id || perito._id; // Tentando tanto id quanto _id (MongoDB costuma usar _id)
                // Definimos o texto visível como o nome do perito (será mostrado ao usuário)
                option.textContent = perito.nome || perito.nome_completo || perito.name; // Tentando diferentes campos de nome
                selectPeritos.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar peritos:', error);
            const mensagemDiv = document.getElementById('mensagem');
            if (mensagemDiv) {
                mostrarMensagem(mensagemDiv, 'Erro ao carregar a lista de peritos. Por favor, atualize a página.', 'erro');
            }
        }
    }
    
    // Referência ao formulário
    const novoCasoForm = document.getElementById('novoCasoForm');
    if (!novoCasoForm) return;
    
    // Referência ao botão de cancelar
    const cancelarBtn = document.getElementById('cancelarBtn');
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', function() {
            // Retornar para a tela inicial
            document.querySelector('main').innerHTML = '<p style="padding: 20px;">Conteúdo aqui futuramente...</p>';
        });
    }
    
    // Referência à div de mensagem
    const mensagemDiv = document.getElementById('mensagem');
    
    // Event listener para o formulário
    novoCasoForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Obter os dados do formulário
        const formData = {
            titulo_caso: document.getElementById('titulo_caso').value,
            responsavel_caso: document.getElementById('responsavel_caso').value, // Agora enviará o ID do perito
            processo_caso: document.getElementById('processo_caso').value,
            data_abertura_caso: document.getElementById('data_abertura_caso').value,
            descricao_caso: document.getElementById('descricao_caso').value,
            status_caso: 'Em andamento' // Status padrão
        };
        
        // Validar campos obrigatórios (exceto status)
        const camposObrigatorios = ['titulo_caso', 'responsavel_caso', 'processo_caso', 'data_abertura_caso', 'descricao_caso'];
        let camposFaltando = false;
        
        for (const campo of camposObrigatorios) {
            if (!formData[campo]) {
                camposFaltando = true;
                break;
            }
        }
        
        if (camposFaltando) {
            if (mensagemDiv) {
                mostrarMensagem(mensagemDiv, 'Por favor, preencha todos os campos obrigatórios.', 'erro');
            }
            return;
        }
        
        try {
            // Fazer a requisição para a API
            const response = await fetch('http://localhost:5000/api/casos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Cadastro bem-sucedido
                if (mensagemDiv) {
                    mostrarMensagem(mensagemDiv, 'Caso cadastrado com sucesso!', 'sucesso');
                }
                
                // Limpar o formulário após 2 segundos e carregar a listagem
                setTimeout(function() {
                    carregarListagemCasos();
                }, 2000);
            } else {
                // Erro no cadastro
                if (mensagemDiv) {
                    mostrarMensagem(mensagemDiv, data.error || 'Erro ao cadastrar o caso. Por favor, tente novamente.', 'erro');
                }
            }
        } catch (error) {
            console.error('Erro:', error);
            if (mensagemDiv) {
                mostrarMensagem(mensagemDiv, 'Erro ao conectar com o servidor. Por favor, verifique sua conexão.', 'erro');
            }
        }
    });
}

// ------------------------------------------------------------------------------------------------------------


// =========================================================
// FUNÇÕES PARA VISUALIZAÇÃO E EDIÇÃO DE DETALHES DO CASO
// =========================================================

// Função para carregar a página de detalhes do caso
window.carregarDetalhesCaso = async function(id) {
    try {
        const mainContent = document.querySelector('main');
        // Armazenar o ID do caso para uso na página de detalhes
        localStorage.setItem('casoAtualId', id);
        
        // Buscar o conteúdo HTML da página detalhes-caso.html
        const response = await fetch('detalhes-caso.html');
        const html = await response.text();
        
        // Extrair apenas o conteúdo dentro do container principal
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyContent = doc.querySelector('.detalhes-caso-container');
        
        if (!bodyContent) {
            mainContent.innerHTML = '<p style="padding: 20px;">Erro ao carregar os detalhes do caso.</p>';
            return;
        }
        
        // Substituir o conteúdo atual do main pelo conteúdo da página de detalhes
        mainContent.innerHTML = '';
        mainContent.appendChild(bodyContent.cloneNode(true));
        
        // Inicializar a página de detalhes
        inicializarPaginaDetalhes(id);
    } catch (error) {
        console.error('Erro ao carregar a página de detalhes:', error);
        document.querySelector('main').innerHTML = '<p style="padding: 20px;">Erro ao carregar os detalhes do caso.</p>';
    }
};

// Função para inicializar a página de detalhes
async function inicializarPaginaDetalhes(id) {
    try {
        // Atualizar o ID exibido no título
        const idCasoSpan = document.getElementById('id-caso');
        if (idCasoSpan) idCasoSpan.textContent = `#${id}`;
        
        // Carregar a lista de peritos primeiro
        const selectPeritos = document.getElementById('responsavel_caso');
        let peritosMap = new Map(); // Mapa para armazenar a relação ID -> Nome do perito
        
        if (selectPeritos) {
            try {
                const peritosResponse = await fetch('http://localhost:5000/api/usuarios/tipo/Perito');
                
                if (!peritosResponse.ok) {
                    throw new Error(`Erro ao carregar peritos: ${peritosResponse.status}`);
                }
                
                const peritos = await peritosResponse.json();
                
                // Limpar o select antes de adicionar novas opções
                selectPeritos.innerHTML = '<option value="">Selecione um perito</option>';
                
                // Adicionar cada perito como uma opção no select
                peritos.forEach(perito => {
                    const option = document.createElement('option');
                    // Definimos o valor da option como o ID do perito
                    const peritoId = perito.id || perito._id;
                    option.value = peritoId;
                    // Definimos o texto visível como o nome do perito
                    const peritoNome = perito.nome || perito.nome_completo || perito.name;
                    option.textContent = peritoNome;
                    selectPeritos.appendChild(option);
                    
                    // Armazenar a relação ID -> Nome no mapa
                    peritosMap.set(peritoId, peritoNome);
                });
            } catch (error) {
                console.error('Erro ao carregar peritos:', error);
                selectPeritos.innerHTML = '<option value="">Erro ao carregar peritos</option>';
            }
        }
        
        // Buscar os detalhes do caso da API
        const response = await fetch(`http://localhost:5000/api/casos/${id}`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar detalhes do caso');
        }
        
        const data = await response.json();
        
        if (!data.success || !data.data) {
            throw new Error('Dados do caso não encontrados');
        }
        
        const caso = data.data;
        
        // Preencher o formulário com os dados do caso
        document.getElementById('titulo_caso').value = caso.titulo_caso || '';
        
        // Definir o responsável selecionado
        if (selectPeritos && caso.responsavel_caso) {
            // Tentar encontrar e selecionar o perito correto
            const opcoes = selectPeritos.options;
            let peritoEncontrado = false;
            
            for (let i = 0; i < opcoes.length; i++) {
                if (opcoes[i].value === caso.responsavel_caso) {
                    selectPeritos.selectedIndex = i;
                    peritoEncontrado = true;
                    break;
                }
            }
            
            // Se não encontrou o perito nas opções mas temos o ID, adicionamos uma opção temporária
            if (!peritoEncontrado && caso.responsavel_caso) {
                const option = document.createElement('option');
                option.value = caso.responsavel_caso;
                // Verificar se temos o nome no mapa, caso contrário, usar "[Nome não disponível]"
                option.textContent = peritosMap.get(caso.responsavel_caso) || "[Nome não disponível]";
                selectPeritos.appendChild(option);
                selectPeritos.value = caso.responsavel_caso;
            }
        }
        
        document.getElementById('processo_caso').value = caso.processo_caso || '';
        
        // Formatar a data para o formato do input date (YYYY-MM-DD)
        if (caso.data_abertura_caso) {
            const data = new Date(caso.data_abertura_caso);
            const dataFormatada = data.toISOString().split('T')[0];
            document.getElementById('data_abertura_caso').value = dataFormatada;
        }
        
        document.getElementById('descricao_caso').value = caso.descricao_caso || '';
        
        // Definir o status selecionado
        const statusSelect = document.getElementById('status_caso');
        if (statusSelect && caso.status_caso) {
            for (let i = 0; i < statusSelect.options.length; i++) {
                if (statusSelect.options[i].value === caso.status_caso) {
                    statusSelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Adicionar event listeners aos botões
        const voltarBtn = document.getElementById('voltarBtn');
        const deletarBtn = document.getElementById('deletarBtn');
        const form = document.getElementById('detalhesCasoForm');
        const mensagemDiv = document.getElementById('mensagem');
        
        if (voltarBtn) {
            voltarBtn.addEventListener('click', function() {
                // Voltar para a listagem de casos
                carregarListagemCasos();
            });
        }
        
        if (deletarBtn) {
            deletarBtn.addEventListener('click', async function() {
                if (!confirm('Tem certeza que deseja excluir este caso? Esta ação não pode ser desfeita.')) {
                    return;
                }
                
                try {
                    const response = await fetch(`http://localhost:5000/api/casos/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        mostrarMensagem(mensagemDiv, 'Caso excluído com sucesso!', 'sucesso');
                        
                        // Após 2 segundos, voltar para a listagem
                        setTimeout(function() {
                            carregarListagemCasos();
                        }, 2000);
                    } else {
                        mostrarMensagem(mensagemDiv, data.error || 'Erro ao excluir o caso', 'erro');
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    mostrarMensagem(mensagemDiv, 'Erro ao conectar com o servidor', 'erro');
                }
            });
        }
        
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Obter os dados do formulário
                const formData = {
                    titulo_caso: document.getElementById('titulo_caso').value,
                    responsavel_caso: document.getElementById('responsavel_caso').value,
                    processo_caso: document.getElementById('processo_caso').value,
                    data_abertura_caso: document.getElementById('data_abertura_caso').value,
                    descricao_caso: document.getElementById('descricao_caso').value,
                    status_caso: document.getElementById('status_caso').value
                };
                
                // Validar campos obrigatórios
                const camposObrigatorios = ['titulo_caso', 'responsavel_caso', 'processo_caso', 'data_abertura_caso', 'descricao_caso'];
                let camposFaltando = false;
                
                for (const campo of camposObrigatorios) {
                    if (!formData[campo]) {
                        camposFaltando = true;
                        break;
                    }
                }
                
                if (camposFaltando) {
                    mostrarMensagem(mensagemDiv, 'Por favor, preencha todos os campos obrigatórios.', 'erro');
                    return;
                }
                
                try {
                    const response = await fetch(`http://localhost:5000/api/casos/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        mostrarMensagem(mensagemDiv, 'Caso atualizado com sucesso!', 'sucesso');
                        
                        // Redirecionamento após 2 segundos
                        setTimeout(function() {
                            carregarListagemCasos();
                        }, 2000);
                    } else {
                        mostrarMensagem(mensagemDiv, data.error || 'Erro ao atualizar o caso', 'erro');
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    mostrarMensagem(mensagemDiv, 'Erro ao conectar com o servidor', 'erro');
                }
            });
        }
        
    } catch (error) {
        console.error('Erro:', error);
        const mensagemDiv = document.getElementById('mensagem');
        if (mensagemDiv) {
            mostrarMensagem(mensagemDiv, 'Erro ao carregar detalhes do caso', 'erro');
        } else {
            document.querySelector('main').innerHTML = '<div class="mensagem erro" style="display:block">Erro ao carregar detalhes do caso</div>';
        }
    }
}

// ------------------------------------------------------------------------------------------------------------


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

// ------------------------------------------------------------------------------------------------------------


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

// ------------------------------------------------------------------------------------------------------------

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

// ------------------------------------------------------------------------------------------------------------


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
            perfilImagem.src = 'https://via.placeholder.com/100';
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