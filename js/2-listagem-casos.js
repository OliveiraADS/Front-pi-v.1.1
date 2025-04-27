// =========================================================
// FUNÇÕES DE GERENCIAMENTO DE CASOS - LISTAGEM
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