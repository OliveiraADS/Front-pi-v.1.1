// Aguardar o carregamento do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Definir a data de hoje como valor padrão para o campo de data
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    document.getElementById('data_abertura_caso').value = dataFormatada;
    
    // Referência ao formulário
    const novoCasoForm = document.getElementById('novoCasoForm');
    
    // Referência ao botão de cancelar
    const cancelarBtn = document.getElementById('cancelarBtn');
    
    // Referência à div de mensagem
    const mensagemDiv = document.getElementById('mensagem');
    
    // Função para validar o formulário
    function validarFormulario() {
        const campos = [
            'titulo_caso',
            'responsavel_caso',
            'processo_caso',
            'data_abertura_caso',
            'descricao_caso'
            // Status removido dos campos obrigatórios
        ];
        
        let valido = true;
        
        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (!elemento.value.trim()) {
                elemento.classList.add('invalido');
                valido = false;
            } else {
                elemento.classList.remove('invalido');
            }
        });
        
        return valido;
    }
    
    // Função para limpar o formulário
    function limparFormulario() {
        novoCasoForm.reset();
        document.getElementById('data_abertura_caso').value = dataFormatada;
        mensagemDiv.className = 'mensagem';
        mensagemDiv.textContent = '';
        mensagemDiv.style.display = 'none';
    }
    
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
    
    // Event listener para o formulário
    novoCasoForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validarFormulario()) {
            mensagemDiv.className = 'mensagem erro';
            mensagemDiv.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            mensagemDiv.style.display = 'block';
            return;
        }
        
        // Obter os dados do formulário
        const formData = {
            titulo_caso: document.getElementById('titulo_caso').value,
            responsavel_caso: document.getElementById('responsavel_caso').value,
            processo_caso: document.getElementById('processo_caso').value,
            data_abertura_caso: document.getElementById('data_abertura_caso').value,
            descricao_caso: document.getElementById('descricao_caso').value,
            status_caso: 'Em andamento' // Definido como padrão "Em andamento"
        };
        
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
                mensagemDiv.className = 'mensagem sucesso';
                mensagemDiv.textContent = 'Caso cadastrado com sucesso!';
                mensagemDiv.style.display = 'block';
                
                // Limpar o formulário após 2 segundos
                setTimeout(limparFormulario, 2000);
            } else {
                // Erro no cadastro
                mensagemDiv.className = 'mensagem erro';
                mensagemDiv.textContent = data.error || 'Erro ao cadastrar o caso. Por favor, tente novamente.';
                mensagemDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro:', error);
            mensagemDiv.className = 'mensagem erro';
            mensagemDiv.textContent = 'Erro ao conectar com o servidor. Por favor, verifique sua conexão.';
            mensagemDiv.style.display = 'block';
        }
    });
});
