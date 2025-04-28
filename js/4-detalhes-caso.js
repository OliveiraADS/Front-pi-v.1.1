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
        
        // Adicionar classes de permissão aos botões (sem duplicação)
        const deletarBtn = document.getElementById('deletarBtn');
        const atualizarBtn = document.getElementById('atualizarBtn');
        
        if (deletarBtn) {
            deletarBtn.classList.add('admin-ou-perito');
        }
        
        if (atualizarBtn) {
            atualizarBtn.classList.add('admin-ou-perito');
        }
        
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
        
        // Log dos dados recebidos para debug
        console.log('Dados do caso recebidos:', caso);
        
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
        
        // Preencher os campos da vítima
        const nomeVitimaInput = document.getElementById('nome_completo_vitima_caso');
        if (nomeVitimaInput) {
            nomeVitimaInput.value = caso.nome_completo_vitima_caso || '';
        }
        
        const dataNascVitimaInput = document.getElementById('data_nac_vitima_caso');
        if (dataNascVitimaInput && caso.data_nac_vitima_caso) {
            const dataNasc = new Date(caso.data_nac_vitima_caso);
            const dataNascFormatada = dataNasc.toISOString().split('T')[0];
            dataNascVitimaInput.value = dataNascFormatada;
        }
        
        const sexoVitimaSelect = document.getElementById('sexo_vitima_caso');
        if (sexoVitimaSelect && caso.sexo_vitima_caso) {
            for (let i = 0; i < sexoVitimaSelect.options.length; i++) {
                if (sexoVitimaSelect.options[i].value === caso.sexo_vitima_caso) {
                    sexoVitimaSelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        const observacaoVitimaTextarea = document.getElementById('observacao_vitima_caso');
        if (observacaoVitimaTextarea) {
            observacaoVitimaTextarea.value = caso.observacao_vitima_caso || '';
        }
        
        // Adicionar event listeners aos botões
        const voltarBtn = document.getElementById('voltarBtn');
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
                    status_caso: document.getElementById('status_caso').value,
                    
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
                
                // Log dos dados que serão enviados para debug
                console.log('Enviando dados para atualização:', formData);
                
                // Validar campos obrigatórios (exceto campos da vítima, que não são obrigatórios)
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
        
        // Aplicar permissões após carregar todos os elementos
        if (typeof verificarPermissoesElementos === 'function') {
            verificarPermissoesElementos();
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