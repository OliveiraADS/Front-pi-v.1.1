document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const mensagemDiv = document.getElementById('mensagem');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Impede o envio padrão do formulário
        
        // Obter os valores dos campos
        const email = document.getElementById('email').value;
        const senha = document.getElementById('password').value;
        
        try {
            // Endereço da API
            const url = 'http://localhost:5000/api/auth/login';
            
            // Configuração da requisição
            const resposta = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });
            
            const dados = await resposta.json();
            
            if (resposta.ok) {
                // Login bem-sucedido
                mensagemDiv.innerHTML = `<p class="sucesso">Login realizado com sucesso! Bem-vindo, ${dados.dados.nome}!</p>`;
                
                // Salvar dados do usuário no localStorage para usar em outras páginas
                localStorage.setItem('usuarioOdontoLegal', JSON.stringify(dados.dados));
                
                // Redirecionar após 1.5 segundos para home.html
                setTimeout(function() {
                    window.location.href = 'home.html';
                }, 1500);
                
            } else {
                // Login falhou
                mensagemDiv.innerHTML = `<p class="erro">${dados.mensagem}</p>`;
            }
            
        } catch (erro) {
            console.error('Erro:', erro);
            mensagemDiv.innerHTML = '<p class="erro">Erro ao conectar com o servidor. Tente novamente mais tarde.</p>';
        }
    });
});