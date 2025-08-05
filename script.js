const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzMT4wSEWWC5-f-8K5MM8Ug1TGim2AvXexX4FAIIPgNaQnH68r63RRYolESNWP5nJGpPA/exec';

document.addEventListener('DOMContentLoaded', function() {
  var loginForm = document.getElementById('login-form');
  var searchForm = document.getElementById('search-form');
  var callsList = document.getElementById('calls-list');
  var resultDiv = document.getElementById('result');
  var usernameInput = document.getElementById('username');
  var passwordInput = document.getElementById('password');
  var loginBtn = document.getElementById('login-btn');
  var dateInput = document.getElementById('date');
  var attendantInput = document.getElementById('attendant');
  var searchBtn = document.getElementById('search-btn');
  var callsSelect = document.getElementById('calls-select');
  var transcribeBtn = document.getElementById('transcribe-btn');
  var audioPlayer = document.getElementById('audio-player');
  var outputDiv = document.getElementById('output');
  var loadingDiv = document.getElementById('loading');

  // Preenche a data atual
  var today = new Date();
  dateInput.value = today.getDate().toString().padStart(2, '0') + '/' +
                   (today.getMonth() + 1).toString().padStart(2, '0') + '/' +
                   today.getFullYear();

  loginBtn.addEventListener('click', function() {
    if (!usernameInput.value.trim() || !passwordInput.value.trim()) {
      alert('Preencha usuário e senha.');
      return;
    }

    loadingDiv.classList.remove('hidden');
    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        username: usernameInput.value,
        password: passwordInput.value
      }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(function(response) { return response.json(); })
    .then(function(result) {
      loadingDiv.classList.add('hidden');
      if (result.success) {
        loginForm.classList.add('hidden');
        searchForm.classList.remove('hidden');
      } else {
        alert(result.error || 'Login inválido');
      }
    })
    .catch(function(error) {
      loadingDiv.classList.add('hidden');
      alert('Erro: ' + error.message);
    });
  });

  searchBtn.addEventListener('click', function() {
    if (!dateInput.value.match(/^\d{2}\/\d{2}\/\d{4}$/) || !attendantInput.value.trim()) {
      alert('Preencha a data (DD/MM/YYYY) e o nome do atendente.');
      return;
    }

    loadingDiv.classList.remove('hidden');
    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'search',
        date: dateInput.value,
        attendant: attendantInput.value
      }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(function(response) { return response.json(); })
    .then(function(result) {
      loadingDiv.classList.add('hidden');
      if (result.error) {
        alert(result.error);
      } else {
        callsSelect.innerHTML = '<option value="">Selecione uma ligação</option>';
        result.calls.forEach(function(call, index) {
          var option = document.createElement('option');
          option.value = call.audioUrl;
          option.text = 'Ligação às ' + call.time;
          callsSelect.appendChild(option);
        });
        searchForm.classList.add('hidden');
        callsList.classList.remove('hidden');
      }
    })
    .catch(function(error) {
      loadingDiv.classList.add('hidden');
      alert('Erro: ' + error.message);
    });
  });

  transcribeBtn.addEventListener('click', function() {
    var selectedUrl = callsSelect.value;
    if (!selectedUrl) {
      alert('Selecione uma ligação.');
      return;
    }

    loadingDiv.classList.remove('hidden');
    audioPlayer.src = selectedUrl;
    audioPlayer.classList.remove('hidden');

    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'transcribe',
        audioUrl: selectedUrl
      }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(function(response) { return response.json(); })
    .then(function(result) {
      loadingDiv.classList.add('hidden');
      if (result.error) {
        alert(result.error);
      } else {
        var output = 'Transcrição Completa:\n' + result.transcription + '\n\n';
        output += 'Resumo:\n';
        output += 'Sentimento: ' + result.summary.sentiment + '\n';
        output += 'Palavras-chave: ' + (result.summary.keywords.length > 0 ? result.summary.keywords.join(', ') : 'Nenhuma') + '\n';
        output += 'Trecho Solicitado: ' + result.summary.request;
        outputDiv.textContent = output;
        callsList.classList.add('hidden');
        resultDiv.classList.remove('hidden');
      }
    })
    .catch(function(error) {
      loadingDiv.classList.add('hidden');
      alert('Erro: ' + error.message);
    });
  });
});
