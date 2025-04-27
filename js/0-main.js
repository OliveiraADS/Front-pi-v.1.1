// =========================================================
// ARQUIVO PRINCIPAL - INICIALIZA O SISTEMA
// =========================================================

// Este arquivo carrega todos os módulos do sistema e inicializa as funcionalidades principais
document.addEventListener('DOMContentLoaded', function() {
    console.log('OdontoLegal - Sistema de Gerenciamento de Perícias Odontológicas');
    console.log('Inicializando o sistema...');
    
    // Verificar se o usuário está logado
    const usuarioData = localStorage.getItem('usuarioOdontoLegal');
    if (!usuarioData) {
        console.log('Nenhum usuário logado. Redirecionando para a página de login...');
        window.location.href = 'login.html';
        return;
    }
    
    // Converter dados do JSON para objeto
    const usuario = JSON.parse(usuarioData);
    console.log('Usuário logado:', usuario.nome_completo, '(', usuario.tipo_perfil, ')');
    
    // Atualizar o header com os dados do usuário
    atualizarHeaderUsuario(usuario);
    
    // Verificar permissões do usuário para mostrar/esconder menus
    verificarPermissoesUsuario();
    
    // Carregar a página inicial por padrão (listagem de casos)
    carregarListagemCasos();
});