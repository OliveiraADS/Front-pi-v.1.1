// Arquivo para integração das páginas na home

document.addEventListener('DOMContentLoaded', function() {
    // Referências para os elementos de navegação
    const casosHeaderLink = document.querySelector('.nav-links a:first-child');
    const listagemCasosLink = document.querySelector('.sidebar-item:first-child');
    const novoCasoLink = document.querySelector('.sidebar-item:nth-child(2)');
    const mainContent = document.querySelector('main');
    
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
            
            if (bodyContent) {
                // Substituir o conteúdo atual do main pelo conteúdo da página de listagem
                mainContent.innerHTML = '';
                mainContent.appendChild(bodyContent.cloneNode(true));
                
                // Carregar os casos
                carregarCasos();
            } else {
                mainContent.innerHTML = '<p style="padding: 20px;">Erro ao carregar a listagem de casos.</p>';
            }
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
            
            if (bodyContent) {
                // Substituir o conteúdo atual do main pelo conteúdo da página de novo caso
                mainContent.innerHTML = '';
                mainContent.appendChild(bodyContent.cloneNode(true));
                
                // Inicializar o formulário
                inicializarFormulario();
            } else {
                mainContent.innerHTML = '<p style="padding: 20px;">Erro ao carregar o formulário de novo caso.</p>';
            }
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
            
            if (bodyContent) {
                // Substituir o conteúdo atual do main pelo conteúdo da página de detalhes
                mainContent.innerHTML = '';
                mainContent.appendChild(bodyContent.cloneNode(true));
                
                // Inicializar a página de detalhes
                inicializarPaginaDetalhes(id);
            } else {
                mainContent.innerHTML = '<p style="padding: 20px;">Erro ao carregar os detalhes do caso.</p>';
            }
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
            document.getElementById('responsavel_caso').value = caso.responsavel_caso || '';
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
                            if (mensagemDiv) {
                                mensagemDiv.className = 'mensagem sucesso';
                                mensagemDiv.textContent = 'Caso excluído com sucesso!';
                                mensagemDiv.style.display = 'block';
                            }
                            
                            // Após 2 segundos, voltar para a listagem
                            setTimeout(function() {
                                carregarListagemCasos();
                            }, 2000);
                        } else {
                            if (mensagemDiv) {
                                mensagemDiv.className = 'mensagem erro';
                                mensagemDiv.textContent = data.error || 'Erro ao excluir o caso';
                                mensagemDiv.style.display = 'block';
                            }
                        }
                    } catch (error) {
                        console.error('Erro:', error);
                        if (mensagemDiv) {
                            mensagemDiv.className = 'mensagem erro';
                            mensagemDiv.textContent = 'Erro ao conectar com o servidor';
                            mensagemDiv.style.display = 'block';
                        }
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
                    
                    // Arquivo para integração das páginas na home (continuação)

                    if (camposFaltando) {
                        if (mensagemDiv) {
                            mensagemDiv.className = 'mensagem erro';
                            mensagemDiv.textContent = 'Por favor, preencha todos os campos obrigatórios.';
                            mensagemDiv.style.display = 'block';
                        }
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
                            if (mensagemDiv) {
                                mensagemDiv.className = 'mensagem sucesso';
                                mensagemDiv.textContent = 'Caso atualizado com sucesso!';
                                mensagemDiv.style.display = 'block';
                            }
                            
                            // Adicionar redirecionamento após 1 segundos
                            setTimeout(function() {
                                carregarListagemCasos();
                            }, 1000);
                        } else {
                            if (mensagemDiv) {
                                mensagemDiv.className = 'mensagem erro';
                                mensagemDiv.textContent = data.error || 'Erro ao atualizar o caso';
                                mensagemDiv.style.display = 'block';
                            }
                        }
                    } catch (error) {
                        console.error('Erro:', error);
                        if (mensagemDiv) {
                            mensagemDiv.className = 'mensagem erro';
                            mensagemDiv.textContent = 'Erro ao conectar com o servidor';
                            mensagemDiv.style.display = 'block';
                        }
                    }
                });
            }
            
        } catch (error) {
            console.error('Erro:', error);
            document.getElementById('mensagem').innerHTML = 
                '<div class="mensagem erro" style="display:block">Erro ao carregar detalhes do caso</div>';
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
                responsavel_caso: document.getElementById('responsavel_caso').value,
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
                    mensagemDiv.className = 'mensagem erro';
                    mensagemDiv.textContent = 'Por favor, preencha todos os campos obrigatórios.';
                    mensagemDiv.style.display = 'block';
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
                        mensagemDiv.className = 'mensagem sucesso';
                        mensagemDiv.textContent = 'Caso cadastrado com sucesso!';
                        mensagemDiv.style.display = 'block';
                    }
                    
                    // Limpar o formulário após 2 segundos e carregar a listagem
                    setTimeout(function() {
                        carregarListagemCasos();
                    }, 2000);
                } else {
                    // Erro no cadastro
                    if (mensagemDiv) {
                        mensagemDiv.className = 'mensagem erro';
                        mensagemDiv.textContent = data.error || 'Erro ao cadastrar o caso. Por favor, tente novamente.';
                        mensagemDiv.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Erro:', error);
                if (mensagemDiv) {
                    mensagemDiv.className = 'mensagem erro';
                    mensagemDiv.textContent = 'Erro ao conectar com o servidor. Por favor, verifique sua conexão.';
                    mensagemDiv.style.display = 'block';
                }
            }
        });
    }
    
    // Função para buscar os casos da API e torná-los clicáveis
    async function carregarCasos() {
        try {
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
                
                casoElement.innerHTML = `
                    <div class="id">${caso.id_caso}</div>
                    <div class="titulo">${caso.titulo_caso}</div>
                    <div class="data">${formatarData(caso.data_abertura_caso)}</div>
                    <div class="responsavel">${caso.responsavel_caso}</div>
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