// =====================================================
// ARQUIVO: novo-caso.js
// DESCRIÇÃO: Gerencia o formulário de cadastro de novo caso com evidências
// =====================================================

// Aguardar o carregamento do DOM antes de executar qualquer código
document.addEventListener('DOMContentLoaded', function() {
    // =====================================================
    // INICIALIZAÇÃO DO FORMULÁRIO
    // =====================================================
    
    // Define a data de hoje como valor padrão para o campo de data
    // Isso garante que o campo de data já venha preenchido com a data atual
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    document.getElementById('data_abertura_caso').value = dataFormatada;
    
    // Referências aos elementos principais do formulário
    const novoCasoForm = document.getElementById('novoCasoForm');
    const cancelarBtn = document.getElementById('cancelarBtn');
    const mensagemDiv = document.getElementById('mensagem');
    const selectPeritos = document.getElementById('responsavel_caso');
    
    // =====================================================
    // FUNÇÕES PARA MANIPULAÇÃO DE ARQUIVOS 
    // =====================================================
    
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
            reader.readAsDataURL(file); // Lê o arquivo como uma URL de dados
            reader.onload = () => resolve(reader.result); // Retorna o resultado quando concluído
            reader.onerror = error => reject(error); // Trata erros de leitura
        });
    }
    
    /**
     * Mostra uma prévia da imagem selecionada
     * @param {HTMLInputElement} input - O elemento input de arquivo
     * @param {string} previewId - O ID do elemento onde a prévia será exibida
     */
    function showImagePreview(input, previewId) {
        const preview = document.getElementById(previewId);
        
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
    
    // Adiciona evento para mostrar prévia das imagens quando um arquivo é selecionado
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
    
    // =====================================================
    // FUNÇÕES PARA COMUNICAÇÃO COM API
    // =====================================================
    
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
            mensagemDiv.className = 'mensagem erro';
            mensagemDiv.textContent = 'Erro ao carregar a lista de peritos. Por favor, atualize a página.';
            mensagemDiv.style.display = 'block';
        }
    }
    
    // Carregar os peritos quando a página carregar
    carregarPeritos();
    
    // =====================================================
    // FUNÇÕES DE VALIDAÇÃO E MANIPULAÇÃO DO FORMULÁRIO
    // =====================================================
    
    /**
     * Valida os campos obrigatórios do formulário
     * @returns {boolean} - true se todos os campos obrigatórios estiverem preenchidos
     */
    function validarFormulario() {
        // Lista de campos obrigatórios
        const campos = [
            'titulo_caso',
            'responsavel_caso',
            'processo_caso',
            'data_abertura_caso',
            'descricao_caso'
        ];
        
        let valido = true;
        
        // Verifica cada campo obrigatório
        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (!elemento.value.trim()) {
                elemento.classList.add('invalido'); // Adiciona estilo visual para campos inválidos
                valido = false;
            } else {
                elemento.classList.remove('invalido');
            }
        });
        
        return valido;
    }
    
    /**
     * Limpa o formulário, resetando todos os campos
     */
    function limparFormulario() {
        novoCasoForm.reset(); // Reseta todos os campos do formulário
        document.getElementById('data_abertura_caso').value = dataFormatada; // Restaura a data atual
        
        // Limpa as prévias de imagens
        uploadFields.forEach(field => {
            const preview = document.getElementById(field.preview);
            if (preview) {
                preview.innerHTML = '<p>Nenhum arquivo selecionado</p>';
            }
        });
        
        // Limpa a mensagem
        mensagemDiv.className = 'mensagem';
        mensagemDiv.textContent = '';
        mensagemDiv.style.display = 'none';
    }
    
    // =====================================================
    // EVENT LISTENERS
    // =====================================================
    
    // Event listener para o botão de cancelar
    cancelarBtn.addEventListener('click', function() {
        limparFormulario();
        
        // Se estiver dentro da página home, retornar para a visão padrão
        if (window.parent !== window) {
            // Estamos em um iframe ou carregados dinamicamente
            const homeMain = window.parent.document.querySelector('main');
            if (homeMain) {
                homeMain.innerHTML = '<p style="padding: 20px;">Conteúdo aqui futuramente...</p>';
            }
        }
    });
    
    // Event listener para o formulário - processa o envio dos dados
    novoCasoForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Previne o envio padrão do formulário
        
        // Valida os campos obrigatórios
        if (!validarFormulario()) {
            mensagemDiv.className = 'mensagem erro';
            mensagemDiv.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            mensagemDiv.style.display = 'block';
            return;
        }
        
        // Mostra mensagem de processamento
        mensagemDiv.className = 'mensagem info';
        mensagemDiv.textContent = 'Processando... Isso pode levar alguns segundos.';
        mensagemDiv.style.display = 'block';
        
        try {
            // Processa os arquivos de upload para Base64
            let radiografiaBase64 = '';
            let odontogramaBase64 = '';
            let documentosBase64 = '';
            
            // Converte radiografia para Base64 se um arquivo foi selecionado
            const radiografiaInput = document.getElementById('radiografia_evidencia');
            if (radiografiaInput && radiografiaInput.files && radiografiaInput.files[0]) {
                // Verifica o tamanho do arquivo antes de converter
                if (!verificarTamanhoArquivo(radiografiaInput.files[0])) {
                    mensagemDiv.className = 'mensagem erro';
                    mensagemDiv.textContent = 'O arquivo de radiografia é muito grande. Use arquivos menores que 5MB.';
                    mensagemDiv.style.display = 'block';
                    return;
                }
                radiografiaBase64 = await fileToBase64(radiografiaInput.files[0]);
            }
            
            // Converte odontograma para Base64 se um arquivo foi selecionado
            const odontogramaInput = document.getElementById('odontograma_evidencia');
            if (odontogramaInput && odontogramaInput.files && odontogramaInput.files[0]) {
                // Verifica o tamanho do arquivo antes de converter
                if (!verificarTamanhoArquivo(odontogramaInput.files[0])) {
                    mensagemDiv.className = 'mensagem erro';
                    mensagemDiv.textContent = 'O arquivo de odontograma é muito grande. Use arquivos menores que 5MB.';
                    mensagemDiv.style.display = 'block';
                    return;
                }
                odontogramaBase64 = await fileToBase64(odontogramaInput.files[0]);
            }
            
            // Converte documento para Base64 se um arquivo foi selecionado
            const documentosInput = document.getElementById('documentos_evidencia');
            if (documentosInput && documentosInput.files && documentosInput.files[0]) {
                // Verifica o tamanho do arquivo antes de converter
                if (!verificarTamanhoArquivo(documentosInput.files[0])) {
                    mensagemDiv.className = 'mensagem erro';
                    mensagemDiv.textContent = 'O arquivo de documento é muito grande. Use arquivos menores que 5MB.';
                    mensagemDiv.style.display = 'block';
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
                nome_completo_vitima_caso: document.getElementById('nome_completo_vitima_caso').value || 'Nome não informado', // Valor padrão se não for informado
                data_nac_vitima_caso: document.getElementById('data_nac_vitima_caso').value || null,
                sexo_vitima_caso: document.getElementById('sexo_vitima_caso').value || '',
                observacao_vitima_caso: document.getElementById('observacao_vitima_caso').value || ''
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
            
            console.log('Enviando dados para a API:', dadosParaEnvio);
            
            // Realiza a requisição para a API
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosParaEnvio)
            });
            
            const data = await response.json();
            
            // Mostre mais detalhes do erro no console
            if (!response.ok) {
                console.error('Detalhes do erro:', data);
            }
            
            if (response.ok) {
                // Cadastro bem-sucedido
                mensagemDiv.className = 'mensagem sucesso';
                mensagemDiv.textContent = 'Caso cadastrado com sucesso!';
                mensagemDiv.style.display = 'block';
                
                // Limpa o formulário após 2 segundos
                setTimeout(limparFormulario, 2000);
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
                
                mensagemDiv.className = 'mensagem erro';
                mensagemDiv.textContent = mensagemErro;
                mensagemDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro completo:', error);
            mensagemDiv.className = 'mensagem erro';
            mensagemDiv.textContent = `Erro ao conectar com o servidor: ${error.message}`;
            mensagemDiv.style.display = 'block';
        }
    });
});