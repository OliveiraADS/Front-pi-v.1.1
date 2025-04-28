// =========================================================
// FUNÇÕES DE CADASTRO DE CASOS
// =========================================================

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
            responsavel_caso: document.getElementById('responsavel_caso').value, // ID do perito
            processo_caso: document.getElementById('processo_caso').value,
            data_abertura_caso: document.getElementById('data_abertura_caso').value,
            descricao_caso: document.getElementById('descricao_caso').value,
            status_caso: 'Em andamento', // Status padrão
            
            // Novos campos da vítima
            nome_completo_vitima_caso: document.getElementById('nome_completo_vitima_caso') ? 
                document.getElementById('nome_completo_vitima_caso').value : '',
            data_nac_vitima_caso: document.getElementById('data_nac_vitima_caso') ? 
                document.getElementById('data_nac_vitima_caso').value : null,
            sexo_vitima_caso: document.getElementById('sexo_vitima_caso') ? 
                document.getElementById('sexo_vitima_caso').value : '',
            observacao_vitima_caso: document.getElementById('observacao_vitima_caso') ? 
                document.getElementById('observacao_vitima_caso').value : ''
        };
        
        // Validar campos obrigatórios (exceto status e campos da vítima, que não são obrigatórios)
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
        
        // Log dos dados que serão enviados para debug
        console.log('Enviando dados para a API:', formData);
        
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

// Exportar a função para o escopo global
window.carregarNovoCaso = carregarNovoCaso;