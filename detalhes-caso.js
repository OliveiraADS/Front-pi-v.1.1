// Aguardar o carregamento do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Referência ao ID do caso (deve ser passado na URL ou armazenado globalmente)
    let casoId;
    
    // Referências aos elementos do formulário
    const idCasoSpan = document.getElementById('id-caso');
    const form = document.getElementById('detalhesCasoForm');
    const voltarBtn = document.getElementById('voltarBtn');
    const deletarBtn = document.getElementById('deletarBtn');
    const atualizarBtn = document.getElementById('atualizarBtn');
    const mensagemDiv = document.getElementById('mensagem');
    
    // Obter o ID do caso armazenado (em uma situação real, seria passado via URL ou estado)
    casoId = localStorage.getItem('casoAtualId');
    if (idCasoSpan) idCasoSpan.textContent = `#${casoId}`;
    
    // Função para carregar os detalhes do caso
    async function carregarDetalhesCaso() {
        try {
            if (!casoId) {
                mostrarMensagem('Erro: ID do caso não encontrado.', 'erro');
                return;
            }
            
            const response = await fetch(`http://localhost:5000/api/casos/${casoId}`);
            
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
            
        } catch (error) {
            console.error('Erro:', error);
            mostrarMensagem('Erro ao carregar detalhes do caso. Por favor, tente novamente.', 'erro');
        }
    }
    
    // Função para mostrar mensagens
    function mostrarMensagem(texto, tipo) {
        mensagemDiv.textContent = texto;
        mensagemDiv.className = `mensagem ${tipo}`;
        mensagemDiv.style.display = 'block';
    }
    
    // Event listener para o botão de voltar
    if (voltarBtn) {
        voltarBtn.addEventListener('click', function() {
            // Se estivermos em uma página carregada dinamicamente, voltar para a listagem
            if (window.parent !== window) {
                window.parent.carregarListagemCasos(); // Função deve estar disponível no escopo pai
            } else {
                history.back(); // Ou simplesmente voltar na história do navegador
            }
        });
    }
    
    // Event listener para o botão de deletar
    if (deletarBtn) {
        deletarBtn.addEventListener('click', async function() {
            if (!casoId) {
                mostrarMensagem('Erro: ID do caso não encontrado.', 'erro');
                return;
            }
            
            if (!confirm('Tem certeza que deseja excluir este caso? Esta ação não pode ser desfeita.')) {
                return;
            }
            
            try {
                const response = await fetch(`http://localhost:5000/api/casos/${casoId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    mostrarMensagem('Caso excluído com sucesso!', 'sucesso');
                    
                    // Após 2 segundos, voltar para a listagem
                    setTimeout(function() {
                        if (window.parent !== window) {
                            window.parent.carregarListagemCasos();
                        } else {
                            window.location.href = 'listagem-caso.html';
                        }
                    }, 2000);
                } else {
                    mostrarMensagem(data.error || 'Erro ao excluir o caso', 'erro');
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarMensagem('Erro ao conectar com o servidor', 'erro');
            }
        });
    }
    
    // Event listener para o formulário (atualização)
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!casoId) {
                mostrarMensagem('Erro: ID do caso não encontrado.', 'erro');
                return;
            }
            
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
            
            for (const campo of camposObrigatorios) {
                if (!formData[campo]) {
                    mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'erro');
                    return;
                }
            }
            
            try {
                const response = await fetch(`http://localhost:5000/api/casos/${casoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    mostrarMensagem('Caso atualizado com sucesso!', 'sucesso');
                } else {
                    mostrarMensagem(data.error || 'Erro ao atualizar o caso', 'erro');
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarMensagem('Erro ao conectar com o servidor', 'erro');
            }
        });
    }
    
    // Carregar os detalhes do caso ao iniciar
    carregarDetalhesCaso();
});
