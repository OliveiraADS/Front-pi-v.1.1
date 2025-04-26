// Esta função serve para formatar a data para o formato brasileiro
function formatarData(dataString) {
    // Cria um objeto Date a partir da string de data
    const data = new Date(dataString);
    // Retorna a data formatada no padrão brasileiro (dia/mês/ano)
    return data.toLocaleDateString('pt-BR');
}

// Esta função busca os usuários da API e cria a lista na página
async function carregarUsuarios() {
    try {
        // Faz uma requisição para a API que busca os usuários
        const response = await fetch('http://localhost:5000/api/usuarios');
        
        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
            throw new Error('Erro ao carregar os usuários');
        }
        
        // Converte a resposta para JSON
        const data = await response.json();
        
        // Pega a lista de usuários do JSON retornado
        // Considerando diferentes formatos possíveis de retorno da API
        const usuarios = data.dados || data.data || [];
        
        // Pega o elemento HTML onde a lista será exibida
        const usuariosListaElement = document.getElementById('usuarios-lista');
        
        // Verifica se não encontrou usuários
        if (usuarios.length === 0) {
            usuariosListaElement.innerHTML = '<div class="no-usuarios">Nenhum usuário encontrado</div>';
            return;
        }
        
        // Limpa a lista antes de adicionar os novos itens
        usuariosListaElement.innerHTML = '';
        
        // Para cada usuário encontrado, cria um elemento na lista
        usuarios.forEach(usuario => {
            // Cria um novo elemento div
            const usuarioElement = document.createElement('div');
            // Adiciona a classe para estilização
            usuarioElement.className = 'usuario-item';
            
            // Formata a data de criação
            const dataCriacao = formatarData(usuario.data_criacao);
            
            // Define o conteúdo HTML do elemento
            usuarioElement.innerHTML = `
                <div class="nome">${usuario.nome_completo || 'N/A'}</div>
                <div class="email">${usuario.email || 'N/A'}</div>
                <div class="tipo">${usuario.tipo_perfil || 'N/A'}</div>
                <div class="cro">${usuario.cro_uf || 'N/A'}</div>
                <div class="data">${dataCriacao}</div>
            `;
            
            // Adiciona o elemento à lista
            usuariosListaElement.appendChild(usuarioElement);
        });
        
    } catch (error) {
        // Em caso de erro, exibe uma mensagem
        console.error('Erro:', error);
        const usuariosListaElement = document.getElementById('usuarios-lista');
        if (usuariosListaElement) {
            usuariosListaElement.innerHTML = 
                '<div class="no-usuarios">Erro ao carregar os usuários. Por favor, tente novamente mais tarde.</div>';
        }
    }
}

// Inicializa a função quando a página carregar
document.addEventListener('DOMContentLoaded', carregarUsuarios);