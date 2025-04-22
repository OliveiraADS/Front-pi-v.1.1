// Script para gerenciar a página de perfil do usuário
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    const usuarioData = localStorage.getItem('usuarioOdontoLegal');
    if (!usuarioData) {
        window.location.href = 'index.html';
        return;
    }
    
    // Converter dados do JSON para objeto
    const usuario = JSON.parse(usuarioData);
    
    // Referências aos elementos da página
    const perfilImagem = document.getElementById('perfilImagem');
    const perfilPrimeiroNome = document.getElementById('perfilPrimeiroNome');
    const perfilSegundoNome = document.getElementById('perfilSegundoNome');
    const perfilNomeCompleto = document.getElementById('perfilNomeCompleto');
    const perfilEmail = document.getElementById('perfilEmail');
    const perfilTelefone = document.getElementById('perfilTelefone');
    const perfilTipo = document.getElementById('perfilTipo');
    const perfilCroUf = document.getElementById('perfilCroUf');
    const uploadInput = document.getElementById('uploadImagem');
    const mensagemDiv = document.getElementById('mensagem');
    
    // Referências aos contadores de casos
    const casosEmAndamentoSpan = document.getElementById('casosEmAndamento');
    const casosFinalizadosSpan = document.getElementById('casosFinalizados');
    const casosArquivadosSpan = document.getElementById('casosArquivados');
    
    // Preencher os dados do perfil
    if (perfilPrimeiroNome) perfilPrimeiroNome.textContent = usuario.primeiro_nome || 'Não informado';
    if (perfilSegundoNome) perfilSegundoNome.textContent = usuario.segundo_nome || 'Não informado';
    if (perfilNomeCompleto) perfilNomeCompleto.textContent = usuario.nome_completo || 'Não informado';
    if (perfilEmail) perfilEmail.textContent = usuario.email || 'Email não disponível';
    if (perfilTelefone) perfilTelefone.textContent = usuario.telefone || 'Não informado';
    if (perfilTipo) perfilTipo.textContent = usuario.tipo_perfil || 'Tipo não disponível';
    if (perfilCroUf) perfilCroUf.textContent = usuario.cro_uf || 'Não informado';
    
    // Carregar a imagem de perfil, se disponível
    if (perfilImagem && usuario.foto_perfil) {
        perfilImagem.src = usuario.foto_perfil;
    }
    
    // Carregar contagem de casos por status
    carregarContagemCasos();
    
    // Função para carregar a contagem de casos por status
    async function carregarContagemCasos() {
        try {
            // Buscar todos os casos da API
            const response = await fetch('http://localhost:5000/api/casos');
            
            if (!response.ok) {
                throw new Error('Erro ao carregar casos');
            }
            
            const data = await response.json();
            
            if (data.success && data.data) {
                const casos = data.data;
                
                // Filtrar casos por responsável e status
                const responsavelId = usuario.id;
                const casosFiltrados = casos.filter(caso => 
                    caso.responsavel_caso === usuario.nome_completo || 
                    caso.responsavel_caso === `${usuario.primeiro_nome} ${usuario.segundo_nome}` ||
                    caso.responsavel_caso.includes(usuario.primeiro_nome)
                );
                
                // Contar casos por status
                const emAndamento = casosFiltrados.filter(caso => caso.status_caso === 'Em andamento').length;
                const finalizados = casosFiltrados.filter(caso => caso.status_caso === 'Finalizado').length;
                const arquivados = casosFiltrados.filter(caso => caso.status_caso === 'Arquivado').length;
                
                // Atualizar os contadores na interface
                if (casosEmAndamentoSpan) casosEmAndamentoSpan.textContent = emAndamento;
                if (casosFinalizadosSpan) casosFinalizadosSpan.textContent = finalizados;
                if (casosArquivadosSpan) casosArquivadosSpan.textContent = arquivados;
            }
        } catch (error) {
            console.error('Erro ao carregar contagem de casos:', error);
            
            // Em caso de erro, manter os contadores em 0
            if (casosEmAndamentoSpan) casosEmAndamentoSpan.textContent = '0';
            if (casosFinalizadosSpan) casosFinalizadosSpan.textContent = '0';
            if (casosArquivadosSpan) casosArquivadosSpan.textContent = '0';
        }
    }
    
    // Função para mostrar mensagens
    function mostrarMensagem(texto, tipo) {
        mensagemDiv.textContent = texto;
        mensagemDiv.className = `mensagem ${tipo}`;
        mensagemDiv.style.display = 'block';
        
        // Ocultar a mensagem após 5 segundos
        setTimeout(() => {
            mensagemDiv.style.display = 'none';
        }, 5000);
    }
    
    // Evento para quando o usuário selecionar uma imagem
    if (uploadInput) {
        uploadInput.addEventListener('change', function(e) {
            const arquivo = e.target.files[0];
            
            if (!arquivo) {
                return;
            }
            
            // Verificar se é uma imagem
            if (!arquivo.type.match('image.*')) {
                mostrarMensagem('Por favor, selecione uma imagem válida.', 'erro');
                return;
            }
            
            // Verificar tamanho (limite de 5MB)
            if (arquivo.size > 5 * 1024 * 1024) {
                mostrarMensagem('A imagem deve ter menos de 5MB.', 'erro');
                return;
            }
            
            // Ler arquivo e converter para Base64
            const leitor = new FileReader();
            leitor.readAsDataURL(arquivo);
            
            leitor.onload = async function() {
                const base64String = leitor.result;
                
                // Pré-visualização da imagem
                if (perfilImagem) {
                    perfilImagem.src = base64String;
                }
                
                // Enviar para a API
                try {
                    const response = await fetch(`http://localhost:5000/api/usuarios/${usuario.id}/foto`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ foto_base64: base64String })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        mostrarMensagem('Foto de perfil atualizada com sucesso!', 'sucesso');
                        
                        // Atualizar dados no localStorage
                        const dadosAtualizados = {
                            ...usuario,
                            foto_perfil: data.dados.foto_perfil
                        };
                        
                        localStorage.setItem('usuarioOdontoLegal', JSON.stringify(dadosAtualizados));
                        
                        // Atualizar a imagem no header
                        const headerImage = document.getElementById('userProfileImage');
                        if (headerImage) {
                            headerImage.src = data.dados.foto_perfil;
                        }
                    } else {
                        mostrarMensagem(data.mensagem || 'Erro ao atualizar foto de perfil', 'erro');
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    mostrarMensagem('Erro de conexão. Tente novamente mais tarde.', 'erro');
                }
            };
            
            leitor.onerror = function() {
                mostrarMensagem('Erro ao processar a imagem selecionada.', 'erro');
            };
        });
    }
});