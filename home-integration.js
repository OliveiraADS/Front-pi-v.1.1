// Arquivo para integração das páginas na home

document.addEventListener('DOMContentLoaded', function() {
    // Referências para os elementos de navegação
    const casosHeaderLink = document.querySelector('.nav-links a:first-child');
    const listagemCasosLink = document.querySelector('.sidebar-item:first-child');
    const novoCasoLink = document.querySelector('.sidebar-item:nth-child(2)');
    const mainContent = document.querySelector('main');
    
    // Função para mostrar mensagens
    function mostrarMensagem(elemento, texto, tipo) {
        if (!elemento) return;
        
        elemento.textContent = texto;
        elemento.className = `mensagem ${tipo}`;
        elemento.style.display = 'block';
    }
    
    // Função para carregar a página de listagem de casos dentro do main
    window.carregarListagemCasos = async function() {
        try {
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
            mainContent.innerHTML = '<p style="padding: 20px;">Erro ao carregar a listagem de casos.</p>';
        }
    };
    
    // Função para carregar a página de novo caso dentro do main
    async function carregarNovoCaso() {
        try {
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
            mainContent.innerHTML = '<p style="padding: 20px;">Erro ao carregar o formulário de novo caso.</p>';
        }
    }
    
    // Função para carregar a página de detalhes do caso
    window.carregarDetalhesCaso = async function(id) {
        try {
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
            mainContent.innerHTML = '<p style="padding: 20px;">Erro ao carregar os detalhes do caso.</p>';
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
                mainContent.innerHTML = '<div class="mensagem erro" style="display:block">Erro ao carregar detalhes do caso</div>';
            }
        }
    }
    
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
                mainContent.innerHTML = '<p style="padding: 20px;">Conteúdo aqui futuramente...</p>';
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
    
    // Função para formatar a data para o formato brasileiro
    function formatarData(dataString) {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    }

    // Função para determinar a classe CSS do status
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
    
    // Adicionar event listeners aos links
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
});

// Função para carregar a página de perfil
window.carregarPerfilUsuario = async function() {
    try {
        // Buscar o conteúdo HTML da página de perfil
        const response = await fetch('perfil.html');
        const html = await response.text();
        
        // Extrair apenas o conteúdo dentro do container principal
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyContent = doc.querySelector('.perfil-container');
        
        if (!bodyContent) {
            document.querySelector('main').innerHTML = '<p style="padding: 20px;">Erro ao carregar o perfil.</p>';
            return;
        }
        
        // Substituir o conteúdo atual do main pelo conteúdo da página de perfil
        const mainContent = document.querySelector('main');
        mainContent.innerHTML = '';
        mainContent.appendChild(bodyContent.cloneNode(true));
        
        // Inicializar a página de perfil manualmente (em vez de carregar o script)
        inicializarPaginaPerfil();
    } catch (error) {
        console.error('Erro ao carregar a página de perfil:', error);
        document.querySelector('main').innerHTML = '<p style="padding: 20px;">Erro ao carregar o perfil.</p>';
    }
};

// Função para inicializar a página de perfil (código do perfil.js incorporado)
function inicializarPaginaPerfil() {
    // Verificar se o usuário está logado
    const usuarioData = localStorage.getItem('usuarioOdontoLegal');
    if (!usuarioData) {
        window.location.href = 'index.html';
        return;
    }
    
    // Converter dados do JSON para objeto
    const usuario = JSON.parse(usuarioData);
    
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
    
    // Evento para quando o usuário selecionar uma imagem
    if (uploadInput) {
        uploadInput.addEventListener('change', function(e) {
            const arquivo = e.target.files[0];
            
            if (!arquivo) {
                return;
            }
            
            // Verificar se é uma imagem
            if (!arquivo.type.match('image.*')) {
                mostrarMensagem('Por favor, selecione uma imagem válida.', 'erro');
                return;
            }
            
            // Verificar tamanho (limite de 5MB)
            if (arquivo.size > 5 * 1024 * 1024) {
                mostrarMensagem('A imagem deve ter menos de 5MB.', 'erro');
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
                        mostrarMensagem('Foto de perfil atualizada com sucesso!', 'sucesso');
                        
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
                        mostrarMensagem(data.mensagem || 'Erro ao atualizar foto de perfil', 'erro');
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    mostrarMensagem('Erro de conexão. Tente novamente mais tarde.', 'erro');
                }
            };
            
            leitor.onerror = function() {
                mostrarMensagem('Erro ao processar a imagem selecionada.', 'erro');
            };
        });
    }
}

// Adicionar event listener para tornar a área de usuário clicável
document.addEventListener('DOMContentLoaded', function() {
    const userInfoElement = document.querySelector('.user-info');
    if (userInfoElement) {
        userInfoElement.style.cursor = 'pointer';
        userInfoElement.addEventListener('click', function() {
            carregarPerfilUsuario();
        });
    }
});