document.addEventListener('DOMContentLoaded', function() {



    // ---> PASSO MAIS IMPORTANTE <---

    // Substitua a URL abaixo pela URL do seu backend na Vercel.

    // Não se esqueça de adicionar /api no final!

    const backendUrl = 'https://backend-transcricao-node.vercel.app/api';



    // Mapeamento dos elementos da página

    const form = document.getElementById('transcriptionForm');

    const submitBtn = document.getElementById('submitBtn');

    const btnText = document.querySelector('.btn-text');

    const loadingSpinner = document.querySelector('.loading-spinner');

    const resultArea = document.getElementById('resultArea');

    const resultContent = document.getElementById('resultContent');



    // Evento de Envio do Formulário

    form.addEventListener('submit', async function(e) {

        e.preventDefault();



        if (backendUrl.includes('SUA_URL_DA_VERCEL_AQUI')) {

            showError('A URL do backend não foi configurada no arquivo script.js. Por favor, edite o arquivo e insira a sua URL da Vercel.');

            return;

        }



        setLoading(true);

        

        const requestPayload = {

            data: document.getElementById('data').value,

            nomeCompleto: document.getElementById('nomeCompleto').value

        };



        try {

            const response = await fetch(backendUrl, {

                method: 'POST',

                headers: {

                    'Content-Type': 'application/json',

                },

                body: JSON.stringify(requestPayload)

            });

            

            const result = await response.json();



            if (!response.ok || !result.success) {

                throw new Error(result.error || 'Erro desconhecido retornado pelo backend.');

            }

            

            showResults(result);



        } catch (error) {

            console.error('Erro no Fetch:', error);

            showError(`Erro de comunicação com o backend. Verifique a URL e a sua conexão. Detalhes: ${error.message}`);

        } finally {

            setLoading(false);

        }

    });



    // Funções Auxiliares

    function setLoading(isLoading) {

        submitBtn.disabled = isLoading;

        btnText.style.display = isLoading ? 'none' : 'block';

        loadingSpinner.style.display = isLoading ? 'block' : 'none';

    }

    

    function showResults(data) {

        const details = data.data;

        let html = `

            <div class="result-item">

                <h4>📞 Informações da Ligação</h4>

                <p><strong>Nome:</strong> ${details.nome || 'N/A'}</p>

                <p><strong>Data:</strong> ${details.data || 'N/A'}</p>

                <p><strong>Hora:</strong> ${details.hora || 'N/A'}</p>

                <p><strong>Fonte:</strong> ${details.fonte || 'N/A'}</p>

            </div>

            <div class="result-item">

                <h4>🎵 Áudio da Ligação</h4>

                <p><a href="${details.linkAudio}" target="_blank" style="color: #667eea; text-decoration: none;">Clique aqui para ouvir o áudio original</a></p>

            </div>

            <div class="result-item">

                <h4>📝 Transcrição Completa</h4>

                <div class="transcription-text">${details.transcricao || 'N/A'}</div>

            </div>

            <div class="result-item">

                <h4>📋 Resumo Executivo</h4>

                <div class="summary-text">${details.resumo || 'N/A'}</div>

            </div>

        `;

        

        resultContent.innerHTML = html;

        resultArea.style.display = 'block';

        resultArea.scrollIntoView({ behavior: 'smooth' });

    }



    function showError(message) {

        resultContent.innerHTML = `<div class="error"><strong>Erro:</strong> ${message}</div>`;

        resultArea.style.display = 'block';

        resultArea.scrollIntoView({ behavior: 'smooth' });

    }

});
