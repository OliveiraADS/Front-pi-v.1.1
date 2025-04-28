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
        console.log('ID do caso (id_caso):', id);
        console.log('ID do MongoDB (_id):', caso._id);
        
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

        // Após carregar os detalhes do caso, carregar as evidências
        // Passar explicitamente tanto o id_caso quanto o _id do MongoDB
        await carregarEvidenciasDoCaso(id, caso._id);
        
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
                if (!confirm('Tem certeza que deseja excluir este caso? Esta ação não pode ser desfeita e também excluirá todas as evidências associadas.')) {
                    return;
                }
                
                try {
                    // Primeiro excluir todas as evidências do caso
                    await excluirEvidenciasDoCaso(id, caso._id);
                    
                    // Depois excluir o caso
                    const response = await fetch(`http://localhost:5000/api/casos/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        mostrarMensagem(mensagemDiv, 'Caso e todas as evidências excluídos com sucesso!', 'sucesso');
                        
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
                    
                    // Campos da vítima
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
                    // Atualizar o caso
                    const response = await fetch(`http://localhost:5000/api/casos/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        // Atualizar todas as evidências do caso
                        const evidenciasAtualizadas = await atualizarEvidencias(id, caso._id);
                        
                        if (evidenciasAtualizadas) {
                            mostrarMensagem(mensagemDiv, 'Caso e evidências atualizados com sucesso!', 'sucesso');
                        } else {
                            mostrarMensagem(mensagemDiv, 'Caso atualizado com sucesso, mas houve problemas ao atualizar algumas evidências.', 'sucesso');
                        }
                        
                        // Após 2 segundos, voltar para a listagem
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
        
        // Adicionar event listener para o botão de adicionar evidência
        const btnAdicionarEvidencia = document.getElementById('adicionar-evidencia');
        if (btnAdicionarEvidencia) {
            btnAdicionarEvidencia.addEventListener('click', function() {
                adicionarNovaEvidencia(caso._id || id);
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

// Função para mostrar mensagens
function mostrarMensagem(elemento, texto, tipo) {
    if (!elemento) return;
    
    elemento.textContent = texto;
    elemento.className = `mensagem ${tipo}`;
    elemento.style.display = 'block';
    
    // Rolar até a mensagem
    elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Função para carregar as evidências do caso - versão corrigida para resolver problema do ID
async function carregarEvidenciasDoCaso(casoId, mongoId) {
    try {
        const evidenciasContainer = document.getElementById('evidencias-container');
        const carregandoElement = document.getElementById('carregando-evidencias');
        const semEvidenciasElement = document.getElementById('sem-evidencias');
        
        if (!evidenciasContainer) {
            console.error('Container de evidências não encontrado');
            return [];
        }
        
        console.log('Iniciando busca de evidências - ID do caso:', casoId);
        console.log('Iniciando busca de evidências - ID do MongoDB:', mongoId);
        
        // Tentar com o _id do MongoDB
        let response = null;
        let data = null;
        let evidencias = [];
        
        if (mongoId) {
            try {
                console.log('Tentando buscar evidências usando _id do MongoDB:', mongoId);
                response = await fetch(`http://localhost:5000/api/evidencias/caso/${mongoId}`);
                
                console.log('Resposta da API para _id:', response.status, response.statusText);
                
                if (response.ok) {
                    data = await response.json();
                    console.log('Dados retornados para _id:', data);
                    
                    if (data.success && data.dados && data.dados.length > 0) {
                        evidencias = data.dados;
                        console.log('Evidências encontradas usando _id do MongoDB:', evidencias.length);
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar com _id:', error);
            }
        }
        
        // Se não encontrou com o _id, tentar com o id_caso
        if (evidencias.length === 0) {
            try {
                console.log('Tentando buscar evidências usando id_caso:', casoId);
                response = await fetch(`http://localhost:5000/api/evidencias/caso/${casoId}`);
                
                console.log('Resposta da API para id_caso:', response.status, response.statusText);
                
                if (response.ok) {
                    data = await response.json();
                    console.log('Dados retornados para id_caso:', data);
                    
                    if (data.success && data.dados && data.dados.length > 0) {
                        evidencias = data.dados;
                        console.log('Evidências encontradas usando id_caso:', evidencias.length);
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar com id_caso:', error);
            }
        }
        
        // ÚLTIMA TENTATIVA: Verificar se o id_caso no banco está como string em vez de ObjectId
        if (evidencias.length === 0 && mongoId) {
            try {
                // Converter o mongoId para string, pois talvez esteja sendo armazenado dessa forma
                console.log('Tentando buscar evidências usando mongoId como string');
                response = await fetch(`http://localhost:5000/api/evidencias/caso/string/${mongoId}`);
                
                console.log('Resposta da API para mongoId como string:', response.status, response.statusText);
                
                if (response.ok) {
                    data = await response.json();
                    console.log('Dados retornados para mongoId como string:', data);
                    
                    if (data.success && data.dados && data.dados.length > 0) {
                        evidencias = data.dados;
                        console.log('Evidências encontradas usando mongoId como string:', evidencias.length);
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar com mongoId como string:', error);
            }
        }
        
        // Exibir resultado final
        if (evidencias.length === 0) {
            // Não há evidências para este caso
            if (carregandoElement) carregandoElement.style.display = 'none';
            if (semEvidenciasElement) semEvidenciasElement.style.display = 'block';
            console.log('Nenhuma evidência encontrada para o caso após todas as tentativas');
            return [];
        }
        
        // Temos evidências, vamos exibi-las
        if (carregandoElement) carregandoElement.style.display = 'none';
        if (semEvidenciasElement) semEvidenciasElement.style.display = 'none';
        
        console.log('Total de evidências encontradas:', evidencias.length);
        
        // Para cada evidência, criar um elemento e adicionar ao container
        evidencias.forEach((evidencia, index) => {
            console.log(`Adicionando evidência ${index + 1}:`, evidencia._id || evidencia.id);
            adicionarEvidenciaAoFormulario(evidencia, index + 1);
        });
        
        return evidencias;
    } catch (error) {
        console.error('Erro ao carregar evidências:', error);
        const carregandoElement = document.getElementById('carregando-evidencias');
        if (carregandoElement) {
            carregandoElement.textContent = 'Erro ao carregar evidências. Tente novamente mais tarde.';
            carregandoElement.style.color = 'red';
        }
        return [];
    }
}

// Função para adicionar uma evidência existente ao formulário
function adicionarEvidenciaAoFormulario(evidencia, index) {
    const template = document.getElementById('template-evidencia');
    const container = document.getElementById('evidencias-container');
    
    if (!template || !container) return;
    
    console.log(`Processando evidência ${index}:`, evidencia);
    
    // Clonar o template
    const novaEvidencia = template.querySelector('.evidencia-item').cloneNode(true);
    
    // Definir o índice
    novaEvidencia.querySelector('.evidencia-index').textContent = index;
    
    // Definir o ID da evidência
    const evidenciaId = evidencia._id || evidencia.id;
    novaEvidencia.querySelector('.evidencia_id').value = evidenciaId;
    
    // Preencher os campos de endereço
    if (evidencia.endereco) {
        novaEvidencia.querySelector('.rua_evidencia').value = evidencia.endereco.rua || '';
        novaEvidencia.querySelector('.numero_evidencia').value = evidencia.endereco.numero || '';
        novaEvidencia.querySelector('.bairro_evidencia').value = evidencia.endereco.bairro || '';
        novaEvidencia.querySelector('.cep_evidencia').value = evidencia.endereco.cep || '';
        novaEvidencia.querySelector('.cidade_evidencia').value = evidencia.endereco.cidade || '';
        novaEvidencia.querySelector('.estado_evidencia').value = evidencia.endereco.estado || '';
    }
    
    // Radiografia
    const radiografiaPreview = novaEvidencia.querySelector('.radiografia_preview');
    const radiografiaInput = novaEvidencia.querySelector('.radiografia_input');
    const radiografiaEvidencia = novaEvidencia.querySelector('.radiografia_evidencia');
    
    if (evidencia.radiografia_evidencia) {
        radiografiaPreview.src = `data:image/jpeg;base64,${evidencia.radiografia_evidencia}`;
        radiografiaEvidencia.value = evidencia.radiografia_evidencia;
    }
    
    radiografiaInput.addEventListener('change', function(e) {
        handleFileInputChange(e, radiografiaPreview, radiografiaEvidencia);
    });
    
    novaEvidencia.querySelector('.radiografia_observacao_evidencia').value = evidencia.radiografia_observacao_evidencia || '';
    
    // Odontograma
    const odontogramaPreview = novaEvidencia.querySelector('.odontograma_preview');
    const odontogramaInput = novaEvidencia.querySelector('.odontograma_input');
    const odontogramaEvidencia = novaEvidencia.querySelector('.odontograma_evidencia');
    
    if (evidencia.odontograma_evidencia) {
        odontogramaPreview.src = `data:image/jpeg;base64,${evidencia.odontograma_evidencia}`;
        odontogramaEvidencia.value = evidencia.odontograma_evidencia;
    }
    
    odontogramaInput.addEventListener('change', function(e) {
        handleFileInputChange(e, odontogramaPreview, odontogramaEvidencia);
    });
    
    novaEvidencia.querySelector('.odontograma_observacao_evidencia').value = evidencia.odontograma_observacao_evidencia || '';
    
    // Documentos
    const documentosPreview = novaEvidencia.querySelector('.documentos_preview');
    const documentosInput = novaEvidencia.querySelector('.documentos_input');
    const documentosEvidencia = novaEvidencia.querySelector('.documentos_evidencia');
    
    if (evidencia.documentos_evidencia) {
        // Verificar se é um PDF ou uma imagem
        if (evidencia.documentos_evidencia.startsWith('JVBER')) {
            // É provavelmente um PDF (base64 de PDF começa com JVBER...)
            documentosPreview.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><path fill="red" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm1-8h-8V7h8v2z"/></svg>';
        } else {
            documentosPreview.src = `data:image/jpeg;base64,${evidencia.documentos_evidencia}`;
        }
        documentosEvidencia.value = evidencia.documentos_evidencia;
    }
    
    documentosInput.addEventListener('change', function(e) {
        handleFileInputChange(e, documentosPreview, documentosEvidencia);
    });
    
    novaEvidencia.querySelector('.documentos_observacao_evidencia').value = evidencia.documentos_observacao_evidencia || '';
    
    // Botão de excluir evidência
    const btnDeletarEvidencia = novaEvidencia.querySelector('.btn-deletar-evidencia');
    btnDeletarEvidencia.addEventListener('click', function() {
        excluirEvidencia(evidenciaId, novaEvidencia);
    });
    
    // Adicionar ao container
    container.appendChild(novaEvidencia);
    
    // Tornar visível
    novaEvidencia.style.display = 'block';
}

// Função para adicionar uma nova evidência em branco ao formulário
function adicionarNovaEvidencia(casoId) {
    const template = document.getElementById('template-evidencia');
    const container = document.getElementById('evidencias-container');
    const semEvidenciasElement = document.getElementById('sem-evidencias');
    
    if (!template || !container) return;
    
    // Ocultar a mensagem "sem evidências" se estiver visível
    if (semEvidenciasElement) semEvidenciasElement.style.display = 'none';
    
    // Contar quantas evidências já existem para definir o próximo índice
    const evidenciasExistentes = container.querySelectorAll('.evidencia-item').length;
    const index = evidenciasExistentes + 1;
    
    // Clonar o template
    const novaEvidencia = template.querySelector('.evidencia-item').cloneNode(true);
    
    // Definir o índice
    novaEvidencia.querySelector('.evidencia-index').textContent = index;
    
    // ID temporário negativo para indicar que é uma nova evidência
    novaEvidencia.querySelector('.evidencia_id').value = `-${index}`;
    
    // Limpar todos os campos
    novaEvidencia.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
    novaEvidencia.querySelectorAll('textarea').forEach(textarea => textarea.value = '');
    novaEvidencia.querySelectorAll('input[type="hidden"]').forEach(input => input.value = '');
    novaEvidencia.querySelectorAll('img').forEach(img => img.src = '');
    
    // Adicionar event listeners para os inputs de arquivo
    const radiografiaInput = novaEvidencia.querySelector('.radiografia_input');
    const radiografiaPreview = novaEvidencia.querySelector('.radiografia_preview');
    const radiografiaEvidencia = novaEvidencia.querySelector('.radiografia_evidencia');
    
    radiografiaInput.addEventListener('change', function(e) {
        handleFileInputChange(e, radiografiaPreview, radiografiaEvidencia);
    });
    
    const odontogramaInput = novaEvidencia.querySelector('.odontograma_input');
    const odontogramaPreview = novaEvidencia.querySelector('.odontograma_preview');
    const odontogramaEvidencia = novaEvidencia.querySelector('.odontograma_evidencia');
    
    odontogramaInput.addEventListener('change', function(e) {
        handleFileInputChange(e, odontogramaPreview, odontogramaEvidencia);
    });
    
    const documentosInput = novaEvidencia.querySelector('.documentos_input');
    const documentosPreview = novaEvidencia.querySelector('.documentos_preview');
    const documentosEvidencia = novaEvidencia.querySelector('.documentos_evidencia');
    
    documentosInput.addEventListener('change', function(e) {
        handleFileInputChange(e, documentosPreview, documentosEvidencia);
    });
    
    // Botão de excluir evidência (neste caso, apenas remove do formulário)
    const btnDeletarEvidencia = novaEvidencia.querySelector('.btn-deletar-evidencia');
    btnDeletarEvidencia.addEventListener('click', function() {
        container.removeChild(novaEvidencia);
        
        // Se não houver mais evidências, mostrar a mensagem "sem evidências"
        if (container.querySelectorAll('.evidencia-item').length === 0) {
            if (semEvidenciasElement) semEvidenciasElement.style.display = 'block';
        }
    });
    
    // Adicionar ao container
    container.appendChild(novaEvidencia);
    
    // Tornar visível
    novaEvidencia.style.display = 'block';
    
    console.log(`Nova evidência adicionada usando ID: ${casoId}`);
}

// Função para lidar com a seleção de arquivos
function handleFileInputChange(event, previewElement, hiddenInput) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // Se for um PDF, mostrar um ícone de PDF
        if (file.type === 'application/pdf') {
            previewElement.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><path fill="red" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm1-8h-8V7h8v2z"/></svg>';
        } else {
            // Se for uma imagem, mostrar a imagem
            previewElement.src = e.target.result;
        }
        
        // Armazenar o Base64 (removendo o prefixo "data:image/jpeg;base64,")
        const base64String = e.target.result.split(',')[1];
        hiddenInput.value = base64String;
    };
    
    if (file.type === 'application/pdf') {
        reader.readAsDataURL(file);
    } else {
        reader.readAsDataURL(file);
    }
}

// Função para excluir uma evidência específica
async function excluirEvidencia(evidenciaId, elementoEvidencia) {
    if (!confirm('Tem certeza que deseja excluir esta evidência? Esta ação não pode ser desfeita.')) {
        return false;
    }
    
    try {
        // Se o ID for negativo, significa que é uma nova evidência que ainda não foi salva
        if (evidenciaId.toString().startsWith('-')) {
            // Apenas remover do DOM
            if (elementoEvidencia && elementoEvidencia.parentNode) {
                elementoEvidencia.parentNode.removeChild(elementoEvidencia);
            }
            return true;
        }
        
        console.log('Excluindo evidência com ID:', evidenciaId);
        
        // Caso contrário, excluir da API
        const response = await fetch(`http://localhost:5000/api/evidencias/${evidenciaId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Resposta da API para exclusão:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error('Erro ao excluir evidência');
        }
        
        // Remover do DOM
        if (elementoEvidencia && elementoEvidencia.parentNode) {
            elementoEvidencia.parentNode.removeChild(elementoEvidencia);
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao excluir evidência:', error);
        alert('Erro ao excluir evidência. Por favor, tente novamente.');
        return false;
    }
}

// Função para excluir todas as evidências de um caso - versão corrigida
async function excluirEvidenciasDoCaso(casoId, mongoId) {
    try {
        console.log('Iniciando exclusão de evidências - ID do caso:', casoId);
        console.log('Iniciando exclusão de evidências - ID do MongoDB:', mongoId);
        
        // Tentar com o _id do MongoDB
        let response = null;
        let data = null;
        let evidencias = [];
        
        if (mongoId) {
            try {
                console.log('Tentando buscar evidências para exclusão usando _id do MongoDB:', mongoId);
                response = await fetch(`http://localhost:5000/api/evidencias/caso/${mongoId}`);
                
                console.log('Resposta da API para _id:', response.status, response.statusText);
                
                if (response.ok) {
                    data = await response.json();
                    
                    if (data.success && data.dados && data.dados.length > 0) {
                        evidencias = data.dados;
                        console.log('Evidências encontradas para exclusão usando _id:', evidencias.length);
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar com _id para exclusão:', error);
            }
        }
        
        // Se não encontrou com o _id, tentar com o id_caso
        if (evidencias.length === 0) {
            try {
                console.log('Tentando buscar evidências para exclusão usando id_caso:', casoId);
                response = await fetch(`http://localhost:5000/api/evidencias/caso/${casoId}`);
                
                console.log('Resposta da API para id_caso:', response.status, response.statusText);
                
                if (response.ok) {
                    data = await response.json();
                    
                    if (data.success && data.dados && data.dados.length > 0) {
                        evidencias = data.dados;
                        console.log('Evidências encontradas para exclusão usando id_caso:', evidencias.length);
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar com id_caso para exclusão:', error);
            }
        }
        
        // ÚLTIMA TENTATIVA: Verificar se o id_caso no banco está como string em vez de ObjectId
        if (evidencias.length === 0 && mongoId) {
            try {
                console.log('Tentando buscar evidências para exclusão usando mongoId como string');
                response = await fetch(`http://localhost:5000/api/evidencias/caso/string/${mongoId}`);
                
                console.log('Resposta da API para mongoId como string:', response.status, response.statusText);
                
                if (response.ok) {
                    data = await response.json();
                    
                    if (data.success && data.dados && data.dados.length > 0) {
                        evidencias = data.dados;
                        console.log('Evidências encontradas para exclusão usando mongoId como string:', evidencias.length);
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar com mongoId como string para exclusão:', error);
            }
        }
        
        // Exibir resultado final
        if (evidencias.length === 0) {
            console.log('Nenhuma evidência encontrada para exclusão após todas as tentativas');
            return true;
        }
        
        console.log('Total de evidências para exclusão:', evidencias.length);
        
        // Para cada evidência, excluir da API
        for (const evidencia of evidencias) {
            const evidenciaId = evidencia._id || evidencia.id;
            console.log('Excluindo evidência:', evidenciaId);
            
            const deleteResponse = await fetch(`http://localhost:5000/api/evidencias/${evidenciaId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Resposta da API para exclusão:', deleteResponse.status, deleteResponse.statusText);
            
            if (!deleteResponse.ok) {
                console.error('Erro ao excluir evidência:', evidenciaId);
            }
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao excluir evidências do caso:', error);
        return false;
    }
}

// Função para atualizar todas as evidências exibidas no formulário - versão corrigida
async function atualizarEvidencias(casoId, mongoId) {
    try {
        console.log('Iniciando atualização de evidências - ID do caso:', casoId);
        console.log('Iniciando atualização de evidências - ID do MongoDB:', mongoId);
        
        // Se não temos o mongoId, usar o casoId
        const idParaEnviar = mongoId || casoId;
        console.log('ID que será usado para atualização das evidências:', idParaEnviar);
        
        const evidenciasElements = document.querySelectorAll('.evidencia-item');
        let todasAtualizadas = true;
        
        console.log('Total de elementos de evidência encontrados no DOM:', evidenciasElements.length);
        
        for (const elemento of evidenciasElements) {
            const evidenciaId = elemento.querySelector('.evidencia_id').value;
            console.log('Processando evidência com ID:', evidenciaId);
            
            // Montar o objeto com os dados da evidência
            const evidenciaData = {
                id_caso: idParaEnviar, // Usar o ID do MongoDB se disponível
                endereco: {
                    rua: elemento.querySelector('.rua_evidencia').value,
                    numero: elemento.querySelector('.numero_evidencia').value,
                    bairro: elemento.querySelector('.bairro_evidencia').value,
                    cep: elemento.querySelector('.cep_evidencia').value,
                    cidade: elemento.querySelector('.cidade_evidencia').value,
                    estado: elemento.querySelector('.estado_evidencia').value
                },
                radiografia_evidencia: elemento.querySelector('.radiografia_evidencia').value,
                radiografia_observacao_evidencia: elemento.querySelector('.radiografia_observacao_evidencia').value,
                odontograma_evidencia: elemento.querySelector('.odontograma_evidencia').value,
                odontograma_observacao_evidencia: elemento.querySelector('.odontograma_observacao_evidencia').value,
                documentos_evidencia: elemento.querySelector('.documentos_evidencia').value,
                documentos_observacao_evidencia: elemento.querySelector('.documentos_observacao_evidencia').value
            };
            
            console.log('Dados da evidência preparados para envio:', {
                id_caso: evidenciaData.id_caso,
                endereco: evidenciaData.endereco
                // Não logar base64 completo para não sobrecarregar o console
            });
            
            // Se o ID começar com hífen, é uma nova evidência que precisa ser criada
            if (evidenciaId.toString().startsWith('-')) {
                console.log('Criando nova evidência...');
                
                // Criar nova evidência
                const createResponse = await fetch('http://localhost:5000/api/evidencias', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(evidenciaData)
                });
                
                console.log('Resposta da API para criação:', createResponse.status, createResponse.statusText);
                
                if (!createResponse.ok) {
                    console.error('Erro ao criar nova evidência');
                    todasAtualizadas = false;
                } else {
                    const createData = await createResponse.json();
                    console.log('Evidência criada com sucesso:', createData);
                }
            } else {
                console.log('Atualizando evidência existente...');
                
                // Atualizar evidência existente
                const updateResponse = await fetch(`http://localhost:5000/api/evidencias/${evidenciaId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(evidenciaData)
                });
                
                console.log('Resposta da API para atualização:', updateResponse.status, updateResponse.statusText);
                
                if (!updateResponse.ok) {
                    console.error('Erro ao atualizar evidência:', evidenciaId);
                    todasAtualizadas = false;
                } else {
                    const updateData = await updateResponse.json();
                    console.log('Evidência atualizada com sucesso:', updateData);
                }
            }
        }
        
        return todasAtualizadas;
    } catch (error) {
        console.error('Erro ao atualizar evidências:', error);
        return false;
    }
}