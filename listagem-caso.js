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

// Função para abrir os detalhes de um caso
function abrirDetalhesCaso(id) {
    // Armazenar o ID do caso para uso na página de detalhes
    localStorage.setItem('casoAtualId', id);
    
    // Redirecionar para a página de detalhes
    window.location.href = 'detalhes-caso.html';
}

// Função para buscar os casos da API
async function carregarCasos() {
    try {
        const response = await fetch('http://localhost:5000/api/casos');
        
        if (!response.ok) {
            throw new Error('Erro ao carregar os casos');
        }
        
        const data = await response.json();
        const casos = data.data || [];
        
        const casosListaElement = document.getElementById('casos-lista');
        
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
                abrirDetalhesCaso(caso.id_caso);
            });
            
            casosListaElement.appendChild(casoElement);
        });
        
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('casos-lista').innerHTML = 
            '<div class="no-casos">Erro ao carregar os casos. Por favor, tente novamente mais tarde.</div>';
    }
}

// Carregar os casos quando a página for carregada
document.addEventListener('DOMContentLoaded', carregarCasos);
