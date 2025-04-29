// =========================================================
// ARQUIVO: 3-cadastro-caso.js
// DESCRIÇÃO: Funções para gerenciar o cadastro de casos na página principal
// Este arquivo é carregado no contexto da página home.html e gerencia
// o carregamento dinâmico do formulário de caso na área principal
// =========================================================

// =========================================================
// FUNÇÕES DE CADASTRO DE CASOS
// =========================================================

/**
 * Carrega o formulário de novo caso na área principal da página
 * Busca o HTML do formulário e o insere no elemento <main>
 */
async function carregarNovoCaso() {
    try {
        const mainContent = document.querySelector('main');
        // Busca o conteúdo HTML da página novo-caso.html
        const response = await fetch('novo-caso.html');
        const html = await response.text();
        
        // Extrai apenas o conteúdo dentro do container principal
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyContent = doc.querySelector('.novo-caso-container');
        
        if (!bodyContent) {
            mainContent.innerHTML = '<p style="padding: 20px;">Erro ao carregar o formulário de novo caso.</p>';
            return;
        }
        
        // Substitui o conteúdo atual do main pelo conteúdo da página de novo caso
        mainContent.innerHTML = '';
        mainContent.appendChild(bodyContent.cloneNode(true));
        
        // Inicializa o formulário carregado dinamicamente
        inicializarFormulario();
    } catch (error) {
        console.error('Erro ao carregar a página de novo caso:', error);
        document.querySelector('main').innerHTML = '<p style="padding: 20px;">Erro ao carregar o formulário de novo caso.</p>';
    }
}

/**
 * Exibe uma mensagem na interface
 * @param {HTMLElement} elemento - Elemento onde a mensagem será exibida
 * @param {string} texto - Texto da mensagem
 * @param {string} tipo - Tipo da mensagem (sucesso, erro, info)
 */
function mostrarMensagem(elemento, texto, tipo) {
    elemento.className = `mensagem ${tipo}`;
    elemento.textContent = texto;
    elemento.style.display = 'block';
}

/**
 * Verifica o tamanho do arquivo antes de processar
 * @param {File} file - O arquivo a ser verificado
 * @param {number} limiteMB - Limite máximo em MB (padrão: 5MB)
 * @returns {boolean} - true se o arquivo estiver dentro do limite
 */
function verificarTamanhoArquivo(file, limiteMB = 5) {
    const tamanhoMaximoBytes = limiteMB * 1024 * 1024;
    if (file.size > tamanhoMaximoBytes) {
        alert(`O arquivo ${file.name} é muito grande. Tamanho máximo: ${limiteMB}MB`);
        return false;
    }
    return true;
}

/**
 * Converte um arquivo para string Base64
 * @param {File} file - O arquivo a ser convertido
 * @returns {Promise<string>} - O arquivo em formato Base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * Mostra uma prévia da imagem selecionada
 * @param {HTMLInputElement} input - O elemento input de arquivo
 * @param {string} previewId - O ID do elemento onde a prévia será exibida
 */
function showImagePreview(input, previewId) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Cria ou atualiza o elemento de imagem
            if (!preview.querySelector('img')) {
                const img = document.createElement('img');
                preview.innerHTML = '';
                preview.appendChild(img);
            }
            
            const img = preview.querySelector('img');
            img.src = e.target.result;
            img.style.display = 'block';
            
            // Adiciona informação do arquivo
            const fileInfo = document.createElement('p');
            fileInfo.className = 'file-info';
            fileInfo.textContent = `Arquivo: ${input.files[0].name}`;
            
            // Remove informação anterior se existir
            const oldFileInfo = preview.querySelector('.file-info');
            if (oldFileInfo) {
                preview.removeChild(oldFileInfo);
            }
            
            preview.appendChild(fileInfo);
        }
        
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.innerHTML = '<p>Nenhum arquivo selecionado</p>';
    }
}

/**
 * Inicializa o formulário após ser carregado dinamicamente
 * Configura os campos, eventos e funções de validação
 */
function inicializarFormulario() {
    // Define a data de hoje como valor padrão para o campo de data
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    const dataInput = document.getElementById('data_abertura_caso');
    if (dataInput) {
        dataInput.value = dataFormatada;
    }
    
    // Carrega os peritos para o select
    const selectPeritos = document.getElementById('responsavel_caso');
    if (selectPeritos) {
        carregarPeritos();
    }
    
    // Configurar os campos de upload de arquivos
    const uploadFields = [
        { input: 'radiografia_evidencia', preview: 'radiografia_preview' },
        { input: 'odontograma_evidencia', preview: 'odontograma_preview' },
        { input: 'documentos_evidencia', preview: 'documentos_preview' }
    ];
    
    uploadFields.forEach(field => {
        const input = document.getElementById(field.input);
        if (input) {
            input.addEventListener('change', function() {
                showImagePreview(this, field.preview);
            });
        }
    });
    
    // Referência ao formulário
    const novoCasoForm = document.getElementById('novoCasoForm');
    if (!novoCasoForm) return;
    
    // Referência ao botão de cancelar
    const cancelarBtn = document.getElementById('cancelarBtn');
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', function() {
            // Verifica se a função carregarListagemCasos existe no objeto window
            if (typeof window.carregarListagemCasos === 'function') {
                window.carregarListagemCasos();
            } else {
                document.querySelector('main').innerHTML = '<p style="padding: 20px;">Operação cancelada</p>';
            }
        });
    }
    
    // Referência à div de mensagem
    const mensagemDiv = document.getElementById('mensagem');
    
    /**
     * Carrega a lista de peritos da API
     * Busca todos os usuários com tipo_perfil = 'Perito' e os adiciona ao select
     */
    async function carregarPeritos() {
        try {
            console.log('Iniciando carregamento de peritos...');
            
            // Faz requisição para a API que retorna apenas os peritos
            const response = await fetch('http://localhost:5000/api/usuarios/tipo/Perito');
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar peritos: ${response.status} ${response.statusText}`);
            }
            
            const peritos = await response.json();
            console.log('Peritos carregados:', peritos);
            
            // Limpa o select antes de adicionar novas opções
            selectPeritos.innerHTML = '<option value="">Selecione um perito</option>';
            
            // Adiciona cada perito como uma opção no select
            peritos.forEach(perito => {
                const option = document.createElement('option');
                // Define o valor da option como o ID do perito (será enviado ao backend)
                option.value = perito.id || perito._id; // Tenta tanto id quanto _id (MongoDB costuma usar _id)
                // Define o texto visível como o nome do perito (será mostrado ao usuário)
                option.textContent = perito.nome || perito.nome_completo || perito.name; // Tenta diferentes campos de nome
                selectPeritos.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar peritos:', error);
            if (mensagemDiv) {
                mostrarMensagem(mensagemDiv, 'Erro ao carregar a lista de peritos. Por favor, atualize a página.', 'erro');
            }
        }
    }
    
    // Event listener para o formulário - processa o envio dos dados
    novoCasoForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar campos obrigatórios
        const camposObrigatorios = ['titulo_caso', 'responsavel_caso', 'processo_caso', 'data_abertura_caso', 'descricao_caso'];
        let camposFaltando = false;
        
        // Verifica cada campo obrigatório
        for (const campo of camposObrigatorios) {
            const elemento = document.getElementById(campo);
            if (!elemento || !elemento.value.trim()) {
                camposFaltando = true;
                if (elemento) elemento.classList.add('invalido');
            } else if (elemento) {
                elemento.classList.remove('invalido');
            }
        }
        
        if (camposFaltando) {
            if (mensagemDiv) {
                mostrarMensagem(mensagemDiv, 'Por favor, preencha todos os campos obrigatórios.', 'erro');
            }
            return;
        }
        
        // Mostra mensagem de carregamento
        if (mensagemDiv) {
            mostrarMensagem(mensagemDiv, 'Processando... Isso pode levar alguns segundos.', 'info');
        }
        
        try {
            // Processar os arquivos de upload para Base64
            let radiografiaBase64 = '';
            let odontogramaBase64 = '';
            let documentosBase64 = '';
            
            // Converte radiografia para Base64 se um arquivo foi selecionado
            const radiografiaInput = document.getElementById('radiografia_evidencia');
            if (radiografiaInput && radiografiaInput.files && radiografiaInput.files[0]) {
                // Verifica o tamanho do arquivo antes de converter
                if (!verificarTamanhoArquivo(radiografiaInput.files[0])) {
                    if (mensagemDiv) {
                        mostrarMensagem(mensagemDiv, 'O arquivo de radiografia é muito grande. Use arquivos menores que 5MB.', 'erro');
                    }
                    return;
                }
                radiografiaBase64 = await fileToBase64(radiografiaInput.files[0]);
            }
            
            // Converte odontograma para Base64 se um arquivo foi selecionado
            const odontogramaInput = document.getElementById('odontograma_evidencia');
            if (odontogramaInput && odontogramaInput.files && odontogramaInput.files[0]) {
                // Verifica o tamanho do arquivo antes de converter
                if (!verificarTamanhoArquivo(odontogramaInput.files[0])) {
                    if (mensagemDiv) {
                        mostrarMensagem(mensagemDiv, 'O arquivo de odontograma é muito grande. Use arquivos menores que 5MB.', 'erro');
                    }
                    return;
                }
                odontogramaBase64 = await fileToBase64(odontogramaInput.files[0]);
            }
            
            // Converte documento para Base64 se um arquivo foi selecionado
            const documentosInput = document.getElementById('documentos_evidencia');
            if (documentosInput && documentosInput.files && documentosInput.files[0]) {
                // Verifica o tamanho do arquivo antes de converter
                if (!verificarTamanhoArquivo(documentosInput.files[0])) {
                    if (mensagemDiv) {
                        mostrarMensagem(mensagemDiv, 'O arquivo de documento é muito grande. Use arquivos menores que 5MB.', 'erro');
                    }
                    return;
                }
                documentosBase64 = await fileToBase64(documentosInput.files[0]);
            }
            
            // Prepara os dados do caso
            const dadosCaso = {
                titulo_caso: document.getElementById('titulo_caso').value,
                responsavel_caso: document.getElementById('responsavel_caso').value,
                processo_caso: document.getElementById('processo_caso').value,
                data_abertura_caso: document.getElementById('data_abertura_caso').value,
                descricao_caso: document.getElementById('descricao_caso').value,
                status_caso: 'Em andamento', // Status padrão
                
                // Dados da vítima
                nome_completo_vitima_caso: document.getElementById('nome_completo_vitima_caso') ? 
                    document.getElementById('nome_completo_vitima_caso').value : '',
                data_nac_vitima_caso: document.getElementById('data_nac_vitima_caso') ? 
                    document.getElementById('data_nac_vitima_caso').value : null,
                sexo_vitima_caso: document.getElementById('sexo_vitima_caso') ? 
                    document.getElementById('sexo_vitima_caso').value : '',
                observacao_vitima_caso: document.getElementById('observacao_vitima_caso') ? 
                    document.getElementById('observacao_vitima_caso').value : ''
            };
            
            // Prepara os dados da evidência - Removendo o id_caso, o backend adicionará automaticamente
            const dadosEvidencia = {
                endereco: {
                    rua: document.getElementById('endereco_rua') ? document.getElementById('endereco_rua').value : '',
                    bairro: document.getElementById('endereco_bairro') ? document.getElementById('endereco_bairro').value : '',
                    cep: document.getElementById('endereco_cep') ? document.getElementById('endereco_cep').value : '',
                    numero: document.getElementById('endereco_numero') ? document.getElementById('endereco_numero').value : '',
                    estado: document.getElementById('endereco_estado') ? document.getElementById('endereco_estado').value : '',
                    cidade: document.getElementById('endereco_cidade') ? document.getElementById('endereco_cidade').value : ''
                },
                radiografia_evidencia: radiografiaBase64,
                radiografia_observacao_evidencia: document.getElementById('radiografia_observacao_evidencia') ? 
                    document.getElementById('radiografia_observacao_evidencia').value : '',
                odontograma_evidencia: odontogramaBase64,
                odontograma_observacao_evidencia: document.getElementById('odontograma_observacao_evidencia') ? 
                    document.getElementById('odontograma_observacao_evidencia').value : '',
                documentos_evidencia: documentosBase64,
                documentos_observacao_evidencia: document.getElementById('documentos_observacao_evidencia') ? 
                    document.getElementById('documentos_observacao_evidencia').value : ''
            };
            
            // Verifica se há pelo menos um campo de evidência preenchido
            const temEvidencia = radiografiaBase64 || odontogramaBase64 || documentosBase64 || 
                (dadosEvidencia.endereco.rua && dadosEvidencia.endereco.rua.trim());
            
            // Define o endpoint e payload baseado na existência de evidências
            let dadosParaEnvio;
            let endpoint;
            
            if (temEvidencia) {
                // Se há evidências, usa o endpoint para criar caso com evidências
                dadosParaEnvio = {
                    caso: dadosCaso,
                    evidencias: [dadosEvidencia]
                };
                endpoint = 'http://localhost:5000/api/casos/com-evidencias';
            } else {
                // Se não há evidências, usa o endpoint padrão para criar apenas o caso
                dadosParaEnvio = dadosCaso;
                endpoint = 'http://localhost:5000/api/casos';
            }
            
            // Log dos dados que serão enviados para debug
            console.log('Enviando dados para a API:', dadosParaEnvio);
            
            // Realiza a requisição para a API
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosParaEnvio)
            });
            
            // Mostre mais detalhes do erro no console
            const data = await response.json();
            
            if (!response.ok) {
                console.error('Detalhes do erro:', data);
            }
            
            if (response.ok) {
                // Cadastro bem-sucedido
                if (mensagemDiv) {
                    mostrarMensagem(mensagemDiv, 'Caso cadastrado com sucesso!', 'sucesso');
                }
                
                // CORREÇÃO: Usar window.carregarListagemCasos que está definida em 2-listagem-casos.js
                setTimeout(function() {
                    if (typeof window.carregarListagemCasos === 'function') {
                        window.carregarListagemCasos();
                    } else {
                        document.querySelector('main').innerHTML = '<p style="padding: 20px;">Caso cadastrado com sucesso! Retorne ao menu para visualizar a listagem.</p>';
                    }
                }, 2000);
            } else {
                // Erro no cadastro - Mensagem mais detalhada
                let mensagemErro = 'Erro ao cadastrar o caso. ';
                
                if (data.mensagem) {
                    mensagemErro += data.mensagem;
                } else if (data.error) {
                    mensagemErro += data.error;
                } else if (data.sucesso === false) {
                    mensagemErro += 'Verifique os dados e tente novamente.';
                }
                
                if (mensagemDiv) {
                    mostrarMensagem(mensagemDiv, mensagemErro, 'erro');
                }
            }
        } catch (error) {
            console.error('Erro completo:', error);
            if (mensagemDiv) {
                mostrarMensagem(mensagemDiv, `Erro ao conectar com o servidor: ${error.message}`, 'erro');
            }
        }
    });
}

// Exportar a função para o escopo global
window.carregarNovoCaso = carregarNovoCaso;