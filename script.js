// =================================================================
// ARQUIVO: script.js
// DESCRIÇÃO: Lógica do frontend com URL do script embutida
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÃO ---
    // AÇÃO: Cole a URL de implantação do seu Google Apps Script aqui
    const GAS_URL = 'https://script.google.com/macros/s/AKfycby1eof3DCaX4-zkbJ1BJG4FbDbtcqiHAug14A1HAktlVzaMQ7cjcNeuvappS3Xlco55bw/exec';

    // --- ELEMENTOS DO DOM ---
    const formContainer = document.getElementById('formContainer');
    const buscaForm = document.getElementById('buscaForm');
    const btnBuscar = document.getElementById('btnBuscar');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const btnText = document.querySelector('.btn-text');

    const linksContainer = document.getElementById('linksContainer');
    const linksList = document.getElementById('linksList');
    const btnVoltarBusca = document.getElementById('btnVoltarBusca');

    const resultadoContainer = document.getElementById('resultadoContainer');
    const erroContainer = document.getElementById('erroContainer');
    const btnNovaBusca = document.getElementById('btnNovaBusca');
    const btnTentarNovamente = document.getElementById('btnTentarNovamente');
    
    // --- ESTADO DA APLICAÇÃO ---
    let formData = {};

    // --- EVENT LISTENERS ---
    buscaForm.addEventListener('submit', handleBuscaSubmit);
    btnVoltarBusca.addEventListener('click', resetToBusca);
    btnNovaBusca.addEventListener('click', resetToBusca);
    btnTentarNovamente.addEventListener('click', resetToBusca);
    
    // Definir data atual
    document.getElementById('data').value = new Date().toISOString().split('T')[0];

    // --- FUNÇÕES PRINCIPAIS ---

    /** ETAPA 1: Lida com o envio do formulário de busca */
    async function handleBuscaSubmit(event) {
        event.preventDefault();
        
        formData = {
            data: document.getElementById('data').value,
            nomeCompleto: document.getElementById('nomeCompleto').value,
            action: 'get_links' // Ação para buscar links
        };
        
        if (!formData.data || !formData.nomeCompleto) {
            showError('Por favor, preencha todos os campos.');
            return;
        }
        
        setLoadingState(true, 'Buscando...');

        try {
            const response = await fetch(GAS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                mode: 'cors'
            });

            const result = await response.json();

            if (result.sucesso) {
                if (result.dados && result.dados.length > 0) {
                    displayCallLinks(result.dados);
                } else {
                    showError(`Nenhuma ligação encontrada para ${formData.nomeCompleto} na data selecionada.`);
                }
            } else {
                showError(result.mensagem, result.detalhes);
            }
        } catch (error) {
            console.error('Erro ao buscar links:', error);
            showError('Erro de conexão ao buscar links.', 'Verifique se a URL no arquivo script.js está correta e se o script foi implantado corretamente.');
        } finally {
            setLoadingState(false, 'Buscar Ligações');
        }
    }

    /** ETAPA 2: Lida com o clique em um link para transcrever */
    async function handleTranscricaoSubmit(link) {
        setLoadingState(true, 'Transcrevendo...');
        linksContainer.style.display = 'none'; // Esconde a lista de links

        const startTime = Date.now();
        
        try {
            const response = await fetch(GAS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: formData.data,
                    nomeCompleto: formData.nomeCompleto,
                    linkLigacao: link,
                    action: 'transcribe' // Ação para transcrever
                }),
                mode: 'cors'
            });

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            const result = await response.json();

            if (result.sucesso) {
                showResult(result.dados, duration);
            } else {
                showError(result.mensagem, result.detalhes);
            }
        } catch (error) {
            console.error('Erro ao transcrever:', error);
            showError('Erro de conexão ao transcrever o áudio.', error.message);
        } finally {
            setLoadingState(false);
        }
    }

    // --- FUNÇÕES DE UI ---

    function displayCallLinks(links) {
        formContainer.style.display = 'none';
        erroContainer.style.display = 'none';
        linksList.innerHTML = ''; // Limpa a lista anterior

        links.forEach(call => {
            const button = document.createElement('button');
            button.className = 'link-button';
            const displayTime = call.time instanceof Object ? new Date(call.time).toLocaleTimeString('pt-BR') : call.time;
            button.textContent = `Ligação das ${displayTime}`;
            button.addEventListener('click', () => handleTranscricaoSubmit(call.link));
            linksList.appendChild(button);
        });

        linksContainer.style.display = 'block';
    }

    function showResult(dados, duration) {
        formContainer.style.display = 'none';
        linksContainer.style.display = 'none';

        document.getElementById('resultadoNome').textContent = dados.nomeCompleto;
        document.getElementById('resultadoData').textContent = new Date(dados.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        document.getElementById('textoTranscricao').textContent = dados.transcricao || 'N/A';
        document.getElementById('textoResumo').textContent = dados.resumo || 'N/A';
        document.getElementById('timestampProcessamento').textContent = new Date(dados.timestamp).toLocaleString('pt-BR');
        document.getElementById('duracaoProcessamento').textContent = `${duration} segundos`;
        
        resultadoContainer.style.display = 'block';
    }

    function showError(message, details = null) {
        formContainer.style.display = 'none';
        linksContainer.style.display = 'none';

        document.getElementById('mensagemErro').textContent = message;
        const detalhesTexto = document.getElementById('erroDetalhesTexto');
        if (details) {
            detalhesTexto.textContent = typeof details === 'object' ? JSON.stringify(details, null, 2) : details;
            detalhesTexto.style.display = 'block';
        } else {
            detalhesTexto.style.display = 'none';
        }
        erroContainer.style.display = 'block';
    }

    function setLoadingState(isLoading, text = 'Buscar Ligações') {
        btnText.textContent = text;
        if (isLoading) {
            btnBuscar.disabled = true;
            loadingSpinner.style.display = 'block';
            btnText.style.display = 'none';
        } else {
            btnBuscar.disabled = false;
            loadingSpinner.style.display = 'none';
            btnText.style.display = 'block';
        }
    }
    
    function resetToBusca() {
        buscaForm.reset();
        document.getElementById('data').value = new Date().toISOString().split('T')[0];
        
        formContainer.style.display = 'block';
        linksContainer.style.display = 'none';
        resultadoContainer.style.display = 'none';
        erroContainer.style.display = 'none';
        
        setLoadingState(false, 'Buscar Ligações');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});
