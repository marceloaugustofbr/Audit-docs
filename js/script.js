// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyAZyYOnifMD_lqs9lJ3nO39RnsrWYvvmwQ",
    authDomain: "controle-docs-dhl.firebaseapp.com",
    projectId: "controle-docs-dhl",
    storageBucket: "controle-docs-dhl.appspot.com",
    messagingSenderId: "1008887636829",
    appId: "1:1008887636829:web:ce833a915144733f233eb4"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Variáveis globais
let currentUser = null;
let currentUserData = {};
let opSelecionada = "";
let dadosSalvos = [];
let currentSort = { column: 'nome', direction: 'asc' };
let currentDocForModal = null;
let statusChart = null;
let comparativoChart = null;
let categoriaChart = null;

// Constantes
const documentos = [
    {categoria:"REQUISITOS LEGAIS", nome:"PGR", periodicidade:"Anual", regra:"Anual (ou sempre que houver mudança significativa no ambiente de trabalho)", descricao:"Programa de Gerenciamento de Riscos - documento obrigatório para empresas com funcionários registrados."},
    {categoria:"REQUISITOS LEGAIS", nome:"PCMSO", periodicidade:"Anual", regra:"Anual", descricao:"Programa de Controle Médico de Saúde Ocupacional - acompanhamento da saúde dos trabalhadores."},
    {categoria:"REQUISITOS LEGAIS", nome:"AEP/AET", periodicidade:"Sempre", regra:"Sempre que houver mudança no posto de trabalho ou processo", descricao:"Análise Ergonômica do Trabalho - avaliação das condições ergonômicas dos postos de trabalho."},
    {categoria:"REQUISITOS LEGAIS", nome:"IPER", periodicidade:"Anual", regra:"Anual (ou quando houver alteração significativa)", descricao:"Inventário de Pontos de Emissão de Ruído - identificação e controle de ruído ocupacional."},
    {categoria:"REQUISITOS LEGAIS", nome:"LAUDO INSALUBRIDADE", periodicidade:"2 anos", regra:"A cada 2 anos ou quando houver alteração no ambiente/processo", descricao:"Laudo técnico que identifica atividades insalubres e determina adicional de insalubridade."},
    {categoria:"REQUISITOS LEGAIS", nome:"LAUDO PERICULOSIDADE", periodicidade:"2 anos", regra:"A cada 2 anos ou quando houver alteração no ambiente/processo", descricao:"Laudo técnico que identifica atividades periculosas e determina adicional de periculosidade."},
    {categoria:"REQUISITOS LEGAIS", nome:"LTCAT", periodicidade:"3 anos", regra:"A cada 3 anos (ou quando houver mudança de layout, maquinário ou processo)", descricao:"Laudo Técnico das Condições Ambientais do Trabalho - necessário para aposentadoria especial."},
    {categoria:"REQUISITOS LEGAIS", nome:"PAE", periodicidade:"Anual", regra:"Anual (teste e atualização)", descricao:"Plano de Ação de Emergência - define procedimentos para situações de emergência."},
    {categoria:"REGULÁTORIOS MERCADO LIVRE", nome:"LAUDO POTABILIDADE DA AGUA", periodicidade:"Semestral", regra:"Semestral (2x por ano)", descricao:"Laudo que atesta a potabilidade da água fornecida na operação."},
    {categoria:"REGULÁTORIOS MERCADO LIVRE", nome:"LAUDO NR12", periodicidade:"Sempre", regra:"Sempre que houver aquisição/alteração de esteiras", descricao:"Laudo de conformidade com a Norma Regulamentadora 12 - segurança em máquinas e equipamentos."},
    {categoria:"REGULÁTORIOS MERCADO LIVRE", nome:"SPDA", periodicidade:"Anual", regra:"Anual e a cada 5 anos", descricao:"Sistema de Proteção contra Descargas Atmosféricas - laudo de inspeção e manutenção."},
    {categoria:"REGULÁTORIOS MERCADO LIVRE", nome:"AVCB", periodicidade:"2 anos", regra:"A cada 2 anos", descricao:"Auto de Vistoria do Corpo de Bombeiros - certificado de prevenção contra incêndio."},
    {categoria:"REGULÁTORIOS MERCADO LIVRE", nome:"LAUDO RACK PORTA PALETES", periodicidade:"Anual", regra:"Anual", descricao:"Laudo de estabilidade e segurança dos racks e estruturas de armazenamento."},
    {categoria:"CIPA", nome:"CIPA - CERTIFICADO DE TREINAMENTO", periodicidade:"Anual", regra:"Anual (renovação)", descricao:"Certificado de treinamento dos membros da Comissão Interna de Prevenção de Acidentes."},
    {categoria:"CIPA", nome:"CIPA - PROCESSO ELEITORAL", periodicidade:"Anual", regra:"Anual", descricao:"Documentação do processo eleitoral para escolha dos representantes da CIPA."},
    {categoria:"CIPA", nome:"CIPA - ATA DE POSSE", periodicidade:"Anual", regra:"Anual", descricao:"Ata de posse dos membros eleitos para la CIPA."},
    {categoria:"CIPA", nome:"CIPA - ATAS DE REUNIÕES", periodicidade:"Mensal", regra:"Mensal", descricao:"Registro das reuniões ordinárias e extraordinárias da CIPA."},
    {categoria:"BRIGADA", nome:"BRIGADA - CERTIFICADO DE TREINAMENTO", periodicidade:"Anual", regra:"Anual", descricao:"Certificado de treinamento dos brigadistas de incêndio."},
    {categoria:"BRIGADA", nome:"BRIGADA - ATA DE REUNIÕES", periodicidade:"Mensal", regra:"Mensal", descricao:"Registro das reuniões de treinamento e atualização da brigada de incêndio."},
    {categoria:"BRIGADA", nome:"VALIDADE EXTINTORES", periodicidade:"Anual", regra:"Anual", descricao:"Certificado de inspeção e manutenção dos extintores de incêndio."},
    {categoria:"BRIGADA", nome:"VALIDADE TESTE HIDROSTÁTICO", periodicidade:"Anual", regra:"Anual", descricao:"Certificado do teste hidrostático realizado nos extintores de incêndio."},
    {categoria:"SIMULADOS", nome:"PRIMEIROS SOCORROS", periodicidade:"Anual", regra:"Anual", descricao:"Registro e avaliação do simulado de primeiros socorros."},
    {categoria:"SIMULADOS", nome:"ABANDONO", periodicidade:"Anual", regra:"Anual", descricao:"Registro e avaliação do simulado de abandono de área."},
    {categoria:"SIMULADOS", nome:"EMERGÊNCIA QUÍMICA", periodicidade:"Anual", regra:"Anual", descricao:"Registro e avaliação do simulado de emergência química."},
    {categoria:"SIMULADOS", nome:"COMBATE AO PRINCÍPIO OF INCÊNDIO", periodicidade:"Anual", regra:"Anual", descricao:"Registro e avaliação do simulado de combate a princípio de incêndio."}
];

const operacoes = [
    "Mercado Livre - Bauru", "Mercado Livre - Avaré", "Mercado Livre - Franca",
    "Mercado Livre - Barretos", "Mercado Livre - Marilia", "Mercado Livre - Cravinhos",
    "Mercado Livre - Araçatuba", "Mercado Livre - Jales", "Mercado Livre - Rio Preto",
    "Mercado Livre - Prudente"
];

// --- VERIFICAÇÃO DE AUTENTICAÇÃO ---
auth.onAuthStateChanged(async (user) => {
    const loader = document.getElementById('loader');
    const mainContainer = document.getElementById('main-container');

    if (user) {
        currentUser = user;
        try {
            const userDoc = await db.collection('usuarios').doc(user.uid).get();
            if (userDoc.exists) {
                currentUserData = userDoc.data();
                
                const userEmailDisplay = document.getElementById('user-email-display');
                if (userEmailDisplay) {
                    userEmailDisplay.textContent = `Olá, ${currentUser.email}`;
                }

                loader.style.display = 'none';
                mainContainer.style.display = 'block';
                await iniciarAplicacao();
            } else {
                alert('Erro: Usuário não encontrado no banco de dados.');
                await auth.signOut();
            }
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            alert('Erro ao carregar dados do usuário.');
        }
    } else {
        window.location.href = 'login.html';
    }
});

// --- FUNÇÕES PRINCIPAIS ---
async function iniciarAplicacao() {
    aplicarTemaSalvo();
    
    // As funções de busca de dados e configuração de UI agora dependem dos dados do usuário
    const docsSnapshot = await buscarDocumentosDoFirestore();
    dadosSalvos = docsSnapshot.docs.map(doc => doc.data());
    
    configurarFiltroOperacoes(); // Função atualizada que prepara o seletor de operações
    configurarEventListeners();
    gerarTabela();
    configurarUiBaseadaNoPapel();
}

function aplicarTemaSalvo() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// ✅ NOVO: Função totalmente refeita para lidar com múltiplas operações
function configurarFiltroOperacoes() {
    const operacaoSelect = document.getElementById('operacao');
    // Limpa opções existentes, mantendo a primeira ("Selecione sua operação")
    while (operacaoSelect.options.length > 1) {
        operacaoSelect.remove(1);
    }

    let operacoesPermitidas = [];

    if (currentUserData.role === 'admin') {
        // Admins têm acesso a todas as operações
        operacoesPermitidas = operacoes;
        operacaoSelect.disabled = false;
    } else if (currentUserData.operacoes && currentUserData.operacoes.length > 0) {
        // Usuários 'user' usam a lista de operações do seu perfil
        operacoesPermitidas = currentUserData.operacoes;
    }

    if (operacoesPermitidas.length > 0) {
        operacoesPermitidas.forEach(op => {
            const option = document.createElement('option');
            option.value = op;
            option.textContent = op;
            operacaoSelect.appendChild(option);
        });

        if (operacoesPermitidas.length === 1) {
            // Se o usuário tem acesso a apenas uma operação, seleciona e desativa o filtro
            operacaoSelect.value = operacoesPermitidas[0];
            opSelecionada = operacoesPermitidas[0];
            operacaoSelect.disabled = true;
        } else {
            // Se tem mais de uma, o filtro fica ativo para ele escolher
            operacaoSelect.disabled = false;
        }
    } else {
        // Se o usuário não é admin e não tem operações definidas
        operacaoSelect.disabled = true;
        document.getElementById('filtro-atual').textContent = "Você não tem operações associadas.";
    }
}


// ✅ NOVO: Função de busca de dados agora usa o operador "in" do Firestore
async function buscarDocumentosDoFirestore() {
    if (currentUserData.role === 'admin') {
        // Admin busca todos os documentos
        return await db.collection('documentosSalvos').get();
    } else if (currentUserData.operacoes && currentUserData.operacoes.length > 0) {
        // Usuário 'user' busca apenas os documentos das operações em sua lista
        // O operador 'in' permite buscar documentos cujo campo 'operacao' corresponde a qualquer valor na lista
        return await db.collection('documentosSalvos').where('operacao', 'in', currentUserData.operacoes).get();
    } else {
        // Se o usuário não for admin e não tiver operações, retorna uma coleção vazia
        console.warn("Usuário sem permissões de admin e sem lista de operações.");
        return { docs: [] }; // Retorna um objeto que simula um snapshot vazio do Firestore
    }
}


async function salvarDocumentoNoFirestore(docData) {
    const docId = `${docData.nome}_${docData.operacao}`.replace(/[\s/.]+/g, '-');
    await db.collection('documentosSalvos').doc(docId).set(docData, { merge: true });
}

// --- FUNÇÕES DE DATA ---
function formatDate(dStr) { 
    if (!dStr) return "";
    if (dStr.toDate) dStr = dStr.toDate();
    const d = new Date(dStr);
    const adjustedDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return adjustedDate.toLocaleDateString('pt-BR');
}

function calcularVencimento(possui, dataStr, periodicidade) {
    if (possui !== 'Sim') return "";
    if (periodicidade === "Sempre") return "Vigência Contínua";
    if (!dataStr) return "";

    const d = new Date(dataStr);
    const meses = {
        "Anual": 12, "Mensal": 1, "2 anos": 24, 
        "3 anos": 36, "Semestral": 6
    }[periodicidade] || 0;

    d.setUTCMonth(d.getUTCMonth() + meses);
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function calcularStatus(possui, dataStr, periodicidade) {
    if (possui === "Não") return "Pendente";
    if (periodicidade === "Sempre") return "Em dia";
    if (!dataStr) return "Pendente";

    const d = new Date(dataStr);
    const meses = {
        "Anual": 12, "Mensal": 1, "2 anos": 24, 
        "3 anos": 36, "Semestral": 6
    }[periodicidade] || 0;

    d.setUTCMonth(d.getUTCMonth() + meses);
    const vencStr = d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const [dia, mes, ano] = vencStr.split('/');
    const dVenc = new Date(Date.UTC(ano, mes - 1, dia));
    const diffDias = Math.ceil((dVenc - hoje) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) return "Vencido";
    if (diffDias <= 30) return "Vence em breve";
    return "Em dia";
}

function statusClass(status) {
    const classes = {
        "Em dia": "status-em-dia",
        "Vence em breve": "status-vence",
        "Vencido": "status-vencido",
        "Pendente": "status-pendente"
    };
    return classes[status] || "status-pendente";
}

// --- FUNÇÕES DA INTERFACE ---
function gerarTabela() {
    const tbody = document.getElementById('tabela-docs');
    const busca = document.getElementById('busca').value.toLowerCase();
    const categoriaFiltro = document.getElementById('categoria').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    tbody.innerHTML = "";
    
    if (!opSelecionada) { 
        document.getElementById('filtro-atual').textContent = "Selecione uma operação para começar.";
        atualizarResumoStatus(); // Limpa o resumo se nenhuma operação for selecionada
        return; 
    }
    
    document.getElementById('filtro-atual').textContent = `Exibindo dados para: ${opSelecionada}`;

    let documentosFiltrados = documentos.filter(doc => {
        const registro = dadosSalvos.find(r => r.nome === doc.nome && r.operacao === opSelecionada);
        const possui = registro?.possui || "Não";
        const data = registro?.data || "";
        const status = calcularStatus(possui, data, doc.periodicidade);
        
        if (statusFilter && status !== statusFilter) return false;
        if (categoriaFiltro && doc.categoria !== categoriaFiltro) return false;
        if (busca && !doc.nome.toLowerCase().includes(busca)) return false;
        return true;
    });

    documentosFiltrados.sort((a, b) => {
        const regA = dadosSalvos.find(r => r.nome === a.nome && r.operacao === opSelecionada) || {};
        const regB = dadosSalvos.find(r => r.nome === b.nome && r.operacao === opSelecionada) || {};

        let valA, valB;

        switch (currentSort.column) {
            case 'categoria': valA = a.categoria; valB = b.categoria; break;
            case 'possui': valA = regA.possui || "Não"; valB = regB.possui || "Não"; break;
            case 'status': 
                valA = calcularStatus(regA.possui || "Não", regA.data || "", a.periodicidade);
                valB = calcularStatus(regB.possui || "Não", regB.data || "", b.periodicidade);
                break;
            case 'data': valA = new Date(regA.data || 0); valB = new Date(regB.data || 0); break;
            case 'vencimento':
                const vencAStr = calcularVencimento((regA.possui || "Não"), regA.data, a.periodicidade);
                const vencBStr = calcularVencimento((regB.possui || "Não"), regB.data, b.periodicidade);
                valA = vencAStr.includes('/') ? new Date(vencAStr.split('/').reverse().join('-')) : new Date(0);
                valB = vencBStr.includes('/') ? new Date(vencBStr.split('/').reverse().join('-')) : new Date(0);
                break;
            default: valA = a.nome; valB = b.nome; break;
        }

        if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    if (documentosFiltrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Nenhum documento encontrado para "${opSelecionada}" com os filtros aplicados.</td></tr>`;
    } else {
        documentosFiltrados.forEach(doc => {
            const registro = dadosSalvos.find(r => r.nome === doc.nome && r.operacao === opSelecionada);
            const possui = registro?.possui || "Não";
            const data = registro?.data || "";
            const status = calcularStatus(possui, data, doc.periodicidade);
            const isSalvarDisabled = (possui === 'Sim' && !data && doc.periodicidade !== 'Sempre');
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${doc.categoria}</td>
                <td><span class="document-name" data-doc-nome="${doc.nome}">${doc.nome}</span></td>
                <td>
                    <select data-doc-nome="${doc.nome}" class="possui-select">
                        <option value="Sim" ${possui === "Sim" ? 'selected' : ''}>Sim</option>
                        <option value="Não" ${possui === "Não" ? 'selected' : ''}>Não</option>
                    </select>
                </td>
                <td><span class="status-label ${statusClass(status)}">${status}</span></td>
                <td>
                    <input type="date" value="${data}" class="date-input" data-doc-nome="${doc.nome}" ${possui === "Não" ? 'style="display:none;"' : ''}>
                </td>
                <td>${calcularVencimento(possui, data, doc.periodicidade)}</td>
                <td>
                    <button class="btn btn-save" data-doc-nome="${doc.nome}" ${isSalvarDisabled ? 'disabled' : ''}><span class="btn-text">Salvar</span></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    atualizarResumoStatus();
}

function atualizarResumoStatus() {
    const counts = { emDia: 0, venceBreve: 0, vencidos: 0, pendentes: 0, total: 0 };
    
    if (opSelecionada) {
        const docsDaOperacao = documentos; // A base de documentos é sempre a mesma
        counts.total = docsDaOperacao.length;

        docsDaOperacao.forEach(doc => {
            const registro = dadosSalvos.find(r => r.nome === doc.nome && r.operacao === opSelecionada);
            const status = calcularStatus(registro?.possui || "Não", registro?.data || "", doc.periodicidade);
            if (status === "Em dia") counts.emDia++;
            else if (status === "Vence em breve") counts.venceBreve++;
            else if (status === "Vencido") counts.vencidos++;
            else if (status === "Pendente") counts.pendentes++;
        });
    }

    document.getElementById('total-docs').textContent = counts.total;
    document.getElementById('em-dia-count').textContent = counts.emDia;
    document.getElementById('vence-breve-count').textContent = counts.venceBreve;
    document.getElementById('vencidos-count').textContent = counts.vencidos;
    document.getElementById('pendentes-count').textContent = counts.pendentes;
}

// --- CONFIGURAÇÃO DE EVENTOS ---
function configurarEventListeners() {
    // Filtros
    document.getElementById('operacao').addEventListener('change', function() {
        opSelecionada = this.value;
        gerarTabela();
    });
    
    document.getElementById('busca').addEventListener('keyup', gerarTabela);
    document.getElementById('categoria').addEventListener('change', gerarTabela);
    document.getElementById('status-filter').addEventListener('change', gerarTabela);

    // Ordenação da tabela
    document.querySelector('thead').addEventListener('click', (e) => {
        const th = e.target.closest('th');
        if (th && th.dataset.sort) {
            const column = th.dataset.sort;
            if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.direction = 'asc';
            }
            gerarTabela();
        }
    });

    // Eventos da tabela (versão unificada e corrigida)
const tbody = document.getElementById('tabela-docs');

tbody.addEventListener('click', async (e) => {
    const target = e.target;

    // Ação 1: Clicou no nome do documento para abrir o modal
    const docNameSpan = target.closest('.document-name');
    if (docNameSpan) {
        const docNome = docNameSpan.dataset.docNome;
        if (docNome) {
            abrirModalDetalhes(docNome);
        }
        return; // Para a execução para não confundir com outros cliques
    }

    // Ação 2: Clicou no botão de salvar
    const saveButton = target.closest('.btn-save');
    if (saveButton) {
        const docNome = saveButton.dataset.docNome;
        if (docNome) {
            await salvarDocumento(saveButton, docNome);
        }
        return; // Para a execução
    }
});
    
    tbody.addEventListener('change', (e) => {
        const target = e.target;
        if (!target.dataset.docNome) return;
    
        const tr = target.closest('tr');
        const possuiSelect = tr.querySelector('.possui-select');
        const dateInput = tr.querySelector('.date-input');
        const saveButton = tr.querySelector('.btn-save');
        const doc = documentos.find(d => d.nome === target.dataset.docNome);
    
        if (target.classList.contains('possui-select')) {
            dateInput.style.display = possuiSelect.value === 'Não' ? 'none' : 'block';
            if (possuiSelect.value === 'Não') dateInput.value = '';
        }
    
        const vencimentoCell = tr.cells[5];
        const vencimentoText = calcularVencimento(possuiSelect.value, dateInput.value, doc.periodicidade);
        vencimentoCell.textContent = vencimentoText;
    
        saveButton.disabled = possuiSelect.value === 'Sim' && !dateInput.value && doc.periodicidade !== 'Sempre';
    });

    // Menu principal
    const menuButtons = [
        'controle', 'dashboard', 'comparativo', 'categoria', 'cronograma', 'pendencias'
    ];
    
    menuButtons.forEach(buttonName => {
        document.getElementById(`btn-${buttonName}`).addEventListener('click', () => showPage(buttonName));
    });

    // Botões gerais
    document.getElementById('btn-dark-mode').addEventListener('click', alternarModoEscuro);
    document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());
    document.getElementById('btn-pdf').addEventListener('click', gerarPDF);
    document.getElementById('btn-export').addEventListener('click', exportarParaCSV);
    document.getElementById('export-json-btn').addEventListener('click', exportarBackupJSON);

    // Modais
    document.getElementById('add-comment').addEventListener('click', adicionarComentario);
    document.getElementById('view-history').addEventListener('click', () => exibirHistorico(currentDocForModal));
    document.getElementById('close-modal').addEventListener('click', () => document.getElementById('doc-modal').style.display = 'none');
    document.querySelector('.close-history').addEventListener('click', () => document.getElementById('history-modal').style.display = 'none');

    // Comentários
    document.getElementById('comments-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-comment-btn')) {
            const commentId = e.target.dataset.commentId;
            apagarComentario(commentId);
        }
    });
}

async function salvarDocumento(target, docNome) {
    const tr = target.closest('tr');
    const possuiAtual = tr.querySelector('.possui-select').value;
    const dataAtual = tr.querySelector('.date-input').value;
    const registroOriginal = dadosSalvos.find(d => d.nome === docNome && d.operacao === opSelecionada);
    const possuiOriginal = registroOriginal?.possui || 'Não';
    const dataOriginal = registroOriginal?.data || '';

    if (possuiAtual === possuiOriginal && dataAtual === dataOriginal) {
        // Usa uma notificação toast para avisar que não há mudanças
        Toastify({
            text: "Nenhuma alteração para salvar",
            duration: 3000,
            gravity: "bottom", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            backgroundColor: "#ffa500", // Laranja para aviso
        }).showToast();
        return;
    }

    // --- LÓGICA DO LOADER (INÍCIO) ---
    const originalText = target.querySelector('.btn-text');
    const loader = document.createElement('div');
    loader.className = 'loader';

    target.disabled = true;
    originalText.classList.add('hidden'); // Esconde o texto
    target.appendChild(loader); // Adiciona o loader
    
    try {
        const dadosParaSalvar = { nome: docNome, operacao: opSelecionada, possui: possuiAtual, data: dataAtual };
        await salvarDocumentoNoFirestore(dadosParaSalvar);
        
        if (possuiAtual !== possuiOriginal) {
            await registrarHistorico(docNome, 'Status Posse', possuiOriginal, possuiAtual);
        }
        if (dataAtual !== dataOriginal) {
            await registrarHistorico(docNome, 'Data do Documento', dataOriginal, dataAtual);
        }
        
        const index = dadosSalvos.findIndex(d => d.nome === docNome && d.operacao === opSelecionada);
        if (index > -1) {
            dadosSalvos[index] = { ...dadosSalvos[index], ...dadosParaSalvar };
        } else {
            dadosSalvos.push(dadosParaSalvar);
        }
        
        gerarTabela(); // Atualiza a tabela para refletir o novo status

        // --- NOTIFICAÇÃO DE SUCESSO ---
        Toastify({
            text: "Documento salvo com sucesso!",
            duration: 3000,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#4caf50", // Verde para sucesso
        }).showToast();

    } catch (error) {
        console.error("Erro ao salvar:", error);
        
        // --- NOTIFICAÇÃO DE ERRO ---
        Toastify({
            text: "Ocorreu um erro ao salvar os dados.",
            duration: 3000,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#ff4d4d", // Vermelho para erro
        }).showToast();

    } finally {
        // --- LÓGICA DO LOADER (FIM) ---
        // Este bloco 'finally' sempre será executado, com sucesso ou erro
        originalText.classList.remove('hidden'); // Mostra o texto novamente
        target.removeChild(loader); // Remove o loader
        const isSalvarDisabled = (possuiAtual === 'Sim' && !dataAtual && documentos.find(d => d.nome === docNome).periodicidade !== 'Sempre');
        target.disabled = isSalvarDisabled;
    }
}

function alternarModoEscuro() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function showPage(pageName) {
    const pages = {
        controle: document.getElementById('controle'),
        dashboard: document.getElementById('dashboard-page'),
        comparativo: document.getElementById('comparativo-page'),
        categoria: document.getElementById('categoria-page'),
        cronograma: document.getElementById('cronograma-page'),
        pendencias: document.getElementById('pendencias-page')
    };
    
    document.querySelectorAll('.menu button').forEach(btn => btn.classList.remove('active'));
    Object.values(pages).forEach(page => page.style.display = 'none');
    
    document.getElementById(`btn-${pageName}`).classList.add('active');
    pages[pageName].style.display = 'block';
    
    switch(pageName) {
        case 'dashboard': gerarDashboard(); criarGrafico(); break;
        case 'comparativo': gerarPainelComparativo(); break;
        case 'categoria': gerarPainelCategoria(); break;
        case 'cronograma': gerarCronogramaVencimentos(); break;
        case 'pendencias': gerarPendencias(); break;
    }
}

function configurarUiBaseadaNoPapel() {
    const elementos = {
        dashboard: document.getElementById('btn-dashboard'),
        comparativo: document.getElementById('btn-comparativo'),
        exportBackup: document.querySelector('.export-backup')
    };
    
    if (currentUserData.role !== 'admin') {
        elementos.dashboard.style.display = 'none';
        elementos.comparativo.style.display = 'none';
        elementos.exportBackup.style.display = 'none';
        
        const tituloExport = document.querySelector('.export-section h3');
        if (tituloExport) {
            tituloExport.textContent = 'Exportação da Operação';
        }
    } else {
        elementos.dashboard.style.display = 'inline-block';
        elementos.comparativo.style.display = 'inline-block';
        elementos.exportBackup.style.display = 'block';
    }
}
// --- FUNÇÕES DE MODAIS E COMENTÁRIOS ---
function abrirModalDetalhes(docNome) {
    currentDocForModal = docNome;
    const doc = documentos.find(d => d.nome === docNome);
    if (doc) {
        document.getElementById('modal-title').textContent = doc.nome;
        document.getElementById('modal-content').innerHTML = `
            <p><strong>Categoria:</strong> ${doc.categoria}</p>
            <p><strong>Periodicidade:</strong> ${doc.periodicidade}</p>
            <p><strong>Regra de Vencimento:</strong> ${doc.regra}</p>
            <p><strong>Descrição:</strong> ${doc.descricao}</p>
        `;
        carregarComentarios(docNome);
        document.getElementById('doc-modal').style.display = 'block';
    }
}

async function adicionarComentario() {
    if (!currentDocForModal || !opSelecionada) {
        alert("Por favor, selecione uma operação antes de comentar.");
        return;
    }
    
    const input = document.getElementById('comment-input');
    const texto = input.value.trim();
    if (!texto) return;
    
    const comentarioData = {
        docNome: currentDocForModal,
        operacao: opSelecionada,
        texto: texto,
        usuarioEmail: currentUser.email,
        usuarioNome: currentUserData.nome || currentUser.email,
        data: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection('comentarios').add(comentarioData);
        input.value = '';
        carregarComentarios(currentDocForModal);
    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
        alert("Erro ao adicionar comentário.");
    }
}

async function carregarComentarios(docNome) {
    if (!opSelecionada) return;
    const container = document.getElementById('comments-container');
    container.innerHTML = 'Carregando comentários...';
    
    try {
        const query = db.collection('comentarios')
            .where('docNome', '==', docNome)
            .where('operacao', '==', opSelecionada)
            .orderBy('data', 'asc');
            
        const snapshot = await query.get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p>Nenhum comentário para esta operação.</p>';
            return;
        }
        
        container.innerHTML = '';
        snapshot.forEach(doc => {
            const comentario = doc.data();
            const div = document.createElement('div');
            div.className = 'comment';

            let deleteButtonHTML = '';
            if (comentario.usuarioEmail === currentUser.email || currentUserData.role === 'admin') {
                deleteButtonHTML = `<span class="delete-comment-btn" data-comment-id="${doc.id}" title="Apagar comentário">🗑️</span>`;
            }

            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div>${comentario.texto}</div>
                        <div class="comment-date">
                            ${formatDate(comentario.data)} - por <strong>${comentario.usuarioNome || comentario.usuarioEmail}</strong>
                        </div>
                    </div>
                    ${deleteButtonHTML}
                </div>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error("Erro ao carregar comentários:", error);
        container.innerHTML = '<p style="color: red;">Erro ao carregar comentários.</p>';
    }
}


async function apagarComentario(commentId) {
    if (!confirm('Tem certeza que deseja apagar este comentário?')) return;
    
    try {
        await db.collection('comentarios').doc(commentId).delete();
        carregarComentarios(currentDocForModal);
    } catch (error) {
        console.error("Erro ao apagar comentário:", error);
        alert("Erro ao apagar comentário.");
    }
}

async function registrarHistorico(nome, campo, valorAntigo, valorNovo) {
    const historicoData = {
        docNome: nome,
        operacao: opSelecionada,
        campo,
        valorAntigo: valorAntigo || "vazio",
        valorNovo: valorNovo || "vazio",
        usuarioEmail: currentUser.email,
        usuarioNome: currentUserData.nome || currentUser.email,
        data: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('historico').add(historicoData);
}

async function exibirHistorico(docName) {
    if (!docName || !opSelecionada) return;
    
    const container = document.getElementById('history-content-container');
    container.innerHTML = 'Carregando histórico...';
    document.getElementById('history-modal').style.display = 'block';
    
    try {
        const query = db.collection('historico')
            .where('docNome', '==', docName)
            .where('operacao', '==', opSelecionada)
            .orderBy('data', 'desc');
            
        const snapshot = await query.get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p>Nenhum histórico de alterações encontrado para esta operação.</p>';
            return;
        }
        
        container.innerHTML = '';
        snapshot.forEach(doc => {
            const item = doc.data();
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <p><strong>Data:</strong> ${new Date(item.data.toDate()).toLocaleString('pt-BR')}</p>
                <p><strong>Usuário:</strong> <strong>${item.usuarioNome || item.usuarioEmail}</strong></p>
                <p><strong>Campo:</strong> ${item.campo}</p>
                <p><strong>Valor anterior:</strong> ${item.valorAntigo}</p>
                <p><strong>Novo valor:</strong> ${item.valorNovo}</p>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        container.innerHTML = '<p style="color: red;">Erro ao carregar histórico.</p>';
    }
}

// --- FUNÇÕES DE EXPORTAÇÃO ---
function exportarParaCSV() {
    if (!opSelecionada) {
        alert('Selecione uma operação primeiro para exportar.');
        return;
    }
    
    const headers = "Categoria,Documento,Possui Documento,Status,Data do Documento,Vencimento\n";
    let rows = "";
    
    documentos.forEach(doc => {
        const registro = dadosSalvos.find(r => r.nome === doc.nome && r.operacao === opSelecionada);
        const possui = registro?.possui || "Não";
        const data = registro?.data || "";
        const status = calcularStatus(possui, data, doc.periodicidade);
        const vencimento = calcularVencimento(possui, data, doc.periodicidade);
        
        rows += `"${doc.categoria}","${doc.nome}","${possui}","${status}","${data}","${vencimento}"\n`;
    });

    const csvContent = headers + rows;
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `controle_documentos_${opSelecionada.replace(/\s/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function gerarPDF() {
    let operacaoParaPDF = opSelecionada;
    if (!operacaoParaPDF) {
        alert('Selecione uma operação para gerar o PDF.');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        const horaAtual = new Date().toLocaleTimeString('pt-BR');
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Cabeçalho
        doc.setFillColor(44, 62, 80);
        doc.rect(0, 0, pageWidth, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('DHL SUPPLY CHAIN', 15, 16);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Controle de Documentos', pageWidth - 15, 16, { align: 'right' });
        
        // Dados da tabela
        const tableData = [];
        documentos.forEach(docItem => {
            const registro = dadosSalvos.find(r => r.nome === docItem.nome && r.operacao === operacaoParaPDF);
            const possui = registro?.possui || "Não";
            const data = registro?.data || "";
            const status = calcularStatus(possui, data, docItem.periodicidade);
            const vencimento = calcularVencimento(possui, data, docItem.periodicidade);
            tableData.push([docItem.categoria, docItem.nome, possui, status, data, vencimento]);
        });

        // Conteúdo
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Relatório: ${operacaoParaPDF}`, 15, 35);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Data: ${dataAtual} às ${horaAtual}`, 15, 42);

        // Tabela
        doc.autoTable({
            head: [['Categoria', 'Documento', 'Possui', 'Status', 'Data', 'Vencimento']],
            body: tableData,
            startY: 50,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [44, 62, 80] },
            theme: 'grid'
        });
        
        const fileName = `Relatorio_${operacaoParaPDF.replace(/\s/g, '_')}_${dataAtual.replace(/\//g, '-')}.pdf`;
        doc.save(fileName);
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar PDF. Verifique o console para detalhes.');
    }
}
function exportarBackupJSON() {
    if (currentUserData.role !== 'admin') {
        alert("Apenas administradores podem exportar o backup completo.");
        return;
    }
    if (!confirm('Isso irá baixar um arquivo com todos os dados de documentos. Deseja continuar?')) return;
    
    db.collection('documentosSalvos').get().then(snapshot => {
        const todosOsDados = snapshot.docs.map(doc => doc.data());
        const backupData = { documentosSalvos: todosOsDados };
        const dataStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().slice(0, 10);
        
        link.download = `backup-controle-docs-${date}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    });
}

// --- DASHBOARDS E RELATÓRIOS ---
function gerarDashboard() {
    const operacoesParaAnalisar = currentUserData.role === 'admin' ? operacoes : (currentUserData.operacoes || []);
    const counts = { emDia: 0, venceBreve: 0, vencidos: 0, pendentes: 0 };

    operacoesParaAnalisar.forEach(op => {
        documentos.forEach(doc => {
            const registro = dadosSalvos.find(r => r.nome === doc.nome && r.operacao === op);
            const status = calcularStatus(registro?.possui || "Não", registro?.data || "", doc.periodicidade);
            if (status === "Em dia") counts.emDia++;
            else if (status === "Vence em breve") counts.venceBreve++;
            else if (status === "Vencido") counts.vencidos++;
            else if (status === "Pendente") counts.pendentes++;
        });
    });

    document.getElementById('dashboard-em-dia').textContent = counts.emDia;
    document.getElementById('dashboard-vence-breve').textContent = counts.venceBreve;
    document.getElementById('dashboard-vencidos').textContent = counts.vencidos;
    document.getElementById('dashboard-pendentes').textContent = counts.pendentes;
}

function criarGrafico() {
    const ctx = document.getElementById('status-chart').getContext('2d');
    if (statusChart) statusChart.destroy();
    
    const operacoesParaAnalisar = currentUserData.role === 'admin' ? operacoes : (currentUserData.operacoes || []);
    const counts = { emDia: 0, venceBreve: 0, vencidos: 0, pendentes: 0 };

    operacoesParaAnalisar.forEach(op => {
        documentos.forEach(doc => {
            const registro = dadosSalvos.find(r => r.nome === doc.nome && r.operacao === op);
            const status = calcularStatus(registro?.possui || "Não", registro?.data || "", doc.periodicidade);
            if (status === "Em dia") counts.emDia++;
            else if (status === "Vence em breve") counts.venceBreve++;
            else if (status === "Vencido") counts.vencidos++;
            else if (status === "Pendente") counts.pendentes++;
        });
    });

    statusChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Em Dia', 'Vence em Breve', 'Vencidos', 'Pendentes'],
            datasets: [{
                data: [counts.emDia, counts.venceBreve, counts.vencidos, counts.pendentes],
                backgroundColor: ['#4caf50', '#ffa500', '#ff4d4d', '#9e9e9e'],
                borderWidth: 1
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { position: 'bottom' }, 
                title: { 
                    display: true, 
                    text: currentUserData.role === 'admin' ? 
                        'Distribuição de Status de Documentos (Geral)' : 
                        `Distribuição de Status - Suas Operações`
                } 
            } 
        }
    });
}

function gerarPainelComparativo() {
    if (currentUserData.role !== 'admin') return;
    const ctx = document.getElementById('comparativo-chart').getContext('2d');
    if (comparativoChart) comparativoChart.destroy();
    
    const labels = operacoes.map(op => op.replace('Mercado Livre - ', ''));
    const data = { emDia: [], venceBreve: [], vencido: [], pendente: [] };
    
    operacoes.forEach(op => {
        const counts = { emDia: 0, venceBreve: 0, vencido: 0, pendente: 0 };
        
        documentos.forEach(doc => {
            const registro = dadosSalvos.find(r => r.nome === doc.nome && r.operacao === op);
            const status = calcularStatus(registro?.possui || "Não", registro?.data || "", doc.periodicidade);
            if (status === "Em dia") counts.emDia++;
            else if (status === "Vence em breve") counts.venceBreve++;
            else if (status === "Vencido") counts.vencido++;
            else if (status === "Pendente") counts.pendente++;
        });
        
        data.emDia.push(counts.emDia);
        data.venceBreve.push(counts.venceBreve);
        data.vencido.push(counts.vencido);
        data.pendente.push(counts.pendente);
    });
    
    comparativoChart = new Chart(ctx, {
        type: 'bar',
        data: { 
            labels, 
            datasets: [
                { label: 'Em dia', data: data.emDia, backgroundColor: '#4caf50' },
                { label: 'Vence em breve', data: data.venceBreve, backgroundColor: '#ffa500' },
                { label: 'Vencido', data: data.vencido, backgroundColor: '#ff4d4d' },
                { label: 'Pendente', data: data.pendente, backgroundColor: '#9e9e9e' }
            ]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            onClick: (event, elements) => {
                if (elements.length === 0) return;
                const { index, datasetIndex } = elements[0];
                const operationName = operacoes[index];
                const statusName = comparativoChart.data.datasets[datasetIndex].label;
                
                showPage('controle');
                document.getElementById('operacao').value = operationName;
                document.getElementById('status-filter').value = statusName;
                opSelecionada = operationName;
                gerarTabela();
            },
            plugins: { 
                title: { 
                    display: true, 
                    text: 'Status de Documentos por Operação' 
                }, 
                tooltip: { 
                    mode: 'index', 
                    intersect: false 
                } 
            },
            scales: { 
                x: { stacked: true }, 
                y: { stacked: true, beginAtZero: true } 
            }
        }
    });
}

function gerarPainelCategoria() {
    const ctx = document.getElementById('categoria-chart').getContext('2d');
    if (categoriaChart) categoriaChart.destroy();
    
    const categorias = [...new Set(documentos.map(d => d.categoria))];
    const data = { emDia: [], venceBreve: [], vencido: [], pendente: [] };
    const operacoesParaAnalisar = currentUserData.role === 'admin' ? operacoes : (currentUserData.operacoes || []);
    
    categorias.forEach(cat => {
        const counts = { emDia: 0, venceBreve: 0, vencido: 0, pendente: 0 };
        const docsNestaCategoria = documentos.filter(d => d.categoria === cat);
        
        docsNestaCategoria.forEach(doc => {
            operacoesParaAnalisar.forEach(op => {
                const registro = dadosSalvos.find(r => r.nome === doc.nome && r.operacao === op);
                const status = calcularStatus(registro?.possui || "Não", registro?.data || "", doc.periodicidade);
                if (status === "Em dia") counts.emDia++;
                else if (status === "Vence em breve") counts.venceBreve++;
                else if (status === "Vencido") counts.vencido++;
                else if (status === "Pendente") counts.pendente++;
            });
        });
        
        data.emDia.push(counts.emDia);
        data.venceBreve.push(counts.venceBreve);
        data.vencido.push(counts.vencido);
        data.pendente.push(counts.pendente);
    });
    
    const tituloGrafico = currentUserData.role === 'admin' ? 
        'Status de Documentos por Categoria (Geral)' : 
        `Status de Documentos por Categoria - Suas Operações`;
    
    categoriaChart = new Chart(ctx, {
        type: 'bar',
        data: { 
            labels: categorias, 
            datasets: [
                { label: 'Em dia', data: data.emDia, backgroundColor: '#4caf50' },
                { label: 'Vence em breve', data: data.venceBreve, backgroundColor: '#ffa500' },
                { label: 'Vencido', data: data.vencido, backgroundColor: '#ff4d4d' },
                { label: 'Pendente', data: data.pendente, backgroundColor: '#9e9e9e' }
            ]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false, 
            indexAxis: 'y',
            plugins: { 
                title: { 
                    display: true, 
                    text: tituloGrafico 
                }, 
                tooltip: { 
                    mode: 'index', 
                    intersect: false 
                } 
            },
            scales: { 
                x: { 
                    stacked: true, 
                    beginAtZero: true,
                    title: { display: true, text: 'Quantidade de Documentos' }
                }, 
                y: { 
                    stacked: true,
                    title: { display: true, text: 'Categorias' }
                } 
            }
        }
    });
}

function gerarCronogramaVencimentos() {
    const container = document.getElementById('cronograma-container');
    container.innerHTML = "";
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const seisMesesDepois = new Date();
    seisMesesDepois.setMonth(seisMesesDepois.getMonth() + 6);
    
    const operacoesParaAnalisar = currentUserData.role === 'admin' ? operacoes : (currentUserData.operacoes || []);
    let vencimentosFuturos = [];
    
    dadosSalvos.forEach(registro => {
        if (!operacoesParaAnalisar.includes(registro.operacao)) return;
        
        const docTemplate = documentos.find(d => d.nome === registro.nome);
        if (docTemplate && registro.possui === 'Sim' && registro.data) {
            const vencimentoStr = calcularVencimento(registro.possui, registro.data, docTemplate.periodicidade);
            
            if (vencimentoStr && vencimentoStr.includes('/')) {
                const [dia, mes, ano] = vencimentoStr.split('/');
                const dataVenc = new Date(Date.UTC(ano, mes - 1, dia));
                const dataVencAjustada = new Date(dataVenc.getTime() + dataVenc.getTimezoneOffset() * 60000);
                
                if (dataVencAjustada >= hoje && dataVencAjustada <= seisMesesDepois) {
                    vencimentosFuturos.push({ 
                        data: dataVencAjustada, 
                        nome: registro.nome, 
                        operacao: registro.operacao,
                        vencimentoStr: vencimentoStr
                    });
                }
            }
        }
    });
    
    vencimentosFuturos.sort((a, b) => a.data - b.data);
    
    if (vencimentosFuturos.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px;">Nenhum documento vencendo nos próximos 6 meses em suas operações.</p>';
        return;
    }
    
    const agrupadosPorMes = {};
    const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
    
    vencimentosFuturos.forEach(item => {
        const mesKey = monthFormatter.format(item.data);
        if (!agrupadosPorMes[mesKey]) agrupadosPorMes[mesKey] = [];
        agrupadosPorMes[mesKey].push(item);
    });
    
    let html = '<h3>Próximos 3 Meses</h3>';
    let countMeses = 0;
    const tresMesesDepois = new Date();
    tresMesesDepois.setMonth(tresMesesDepois.getMonth() + 3);
    
    for (const mes in agrupadosPorMes) {
        const primeiroItemDoMes = agrupadosPorMes[mes][0];
        if (primeiroItemDoMes.data < tresMesesDepois) {
            html += `<div class="operation-group"><div class="operation-title">${mes.charAt(0).toUpperCase() + mes.slice(1)}</div>`;
            agrupadosPorMes[mes].forEach(item => {
                html += `<div class="operation-doc">
                    <span><strong>${item.nome}</strong> (${item.operacao})</span>
                    <span>Vence em: ${item.vencimentoStr}</span>
                </div>`;
            });
            html += `</div>`;
            countMeses++;
        }
    }
    
    if (countMeses === 0) {
        html += '<p style="text-align:center; padding: 10px; color: #666;">Nenhum vencimento nos próximos 3 meses.</p>';
    }
    
    html += '<h3 style="margin-top: 30px;">De 4 a 6 meses</h3>';
    let countMesesPosteriores = 0;
    
    for (const mes in agrupadosPorMes) {
        const primeiroItemDoMes = agrupadosPorMes[mes][0];
        if (primeiroItemDoMes.data >= tresMesesDepois) {
            html += `<div class="operation-group"><div class="operation-title">${mes.charAt(0).toUpperCase() + mes.slice(1)}</div>`;
            agrupadosPorMes[mes].forEach(item => {
                html += `<div class="operation-doc">
                    <span><strong>${item.nome}</strong> (${item.operacao})</span>
                    <span>Vence em: ${item.vencimentoStr}</span>
                </div>`;
            });
            html += `</div>`;
            countMesesPosteriores++;
        }
    }
    
    if (countMesesPosteriores === 0) {
        html += '<p style="text-align:center; padding: 10px; color: #666;">Nenhum vencimento neste período.</p>';
    }
    
    container.innerHTML = html;
}

function gerarPendencias() {
    const pend = document.getElementById('pendencias');
    pend.innerHTML = "";
    
    const operacoesParaAnalisar = currentUserData.role === 'admin' ? operacoes : (currentUserData.operacoes || []);
    let temPendenciasGerais = false;
    
    operacoesParaAnalisar.forEach(op => {
        const opDiv = document.createElement('div'); 
        opDiv.classList.add('operation-group');
        opDiv.innerHTML = `<div class="operation-title">${op}</div>`;
        let temPendencias = false;
        
        documentos.forEach(doc => {
            const registro = dadosSalvos.find(r => r.nome === doc.nome && r.operacao === op);
            const status = calcularStatus(registro?.possui || "Não", registro?.data || "", doc.periodicidade);
            
            if (status === "Pendente") {
                const div = document.createElement('div'); 
                div.classList.add('operation-doc');
                div.innerHTML = `<span>${doc.nome}</span><span class="status-label ${statusClass(status)}">${status}</span>`;
                opDiv.appendChild(div); 
                temPendencias = true;
                temPendenciasGerais = true;
            }
        });
        
        if (temPendencias) {
            pend.appendChild(opDiv);
        }
    });
    
    if (!temPendenciasGerais) {
        pend.innerHTML = '<p style="text-align:center; padding: 20px;">Nenhum documento pendente encontrado em suas operações.</p>';
    }
}