// ================================
// Contas da Casa
// ================================

let contasCasaFixas = JSON.parse(localStorage.getItem("contasCasaFixas")) || [];

let lancamentosCasa = JSON.parse(localStorage.getItem("lancamentosCasa")) || [];

// ================================
// Utilitário: mês atual "yyyy-mm"
// ================================

function mesAtualCasaStr() {

    const hoje = new Date();

    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

}

// ================================
// Utilitário: formatar "yyyy-mm" para "Mês/Ano"
// ================================

function formatarMesCasa(mesReferencia) {

    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const [ano, mes] = mesReferencia.split("-").map(Number);

    return `${meses[mes - 1]}/${ano}`;

}

// ================================
// Salvar Conta Fixa
// ================================

function salvarContaCasa() {

    const nome = document.getElementById("nomeContaCasa").value.trim();

    const categoria = document.getElementById("categoriaContaCasa").value;

    const valorPadrao = parseFloat(document.getElementById("valorContaCasa").value) || 0;

    const diaVencimento = parseInt(document.getElementById("vencimentoContaCasa").value);

    if (nome === "") {

        alert("Informe o nome da conta.");

        return;

    }

    if (valorPadrao <= 0) {

        alert("Informe um valor válido.");

        return;

    }

    if (!diaVencimento || diaVencimento < 1 || diaVencimento > 31) {

        alert("Informe um dia de vencimento válido (1 a 31).");

        return;

    }

    contasCasaFixas.push({

        id: Date.now(),

        nome,

        categoria,

        valorPadrao,

        diaVencimento

    });

    salvarLocalContasCasaFixas();

    limparFormularioContaCasa();

    listarContasCasaFixas();

    gerarLancamentosMesAtual();

    popularMesesCasa();

}

// ================================
// Salvar LocalStorage
// ================================

function salvarLocalContasCasaFixas() {

    localStorage.setItem("contasCasaFixas", JSON.stringify(contasCasaFixas));

}

function salvarLocalLancamentosCasa() {

    localStorage.setItem("lancamentosCasa", JSON.stringify(lancamentosCasa));

}

// ================================
// Limpar Formulário
// ================================

function limparFormularioContaCasa() {

    document.getElementById("nomeContaCasa").value = "";

    document.getElementById("valorContaCasa").value = "";

    document.getElementById("vencimentoContaCasa").value = "";

}

// ================================
// Listar Contas Fixas Cadastradas
// ================================

function listarContasCasaFixas() {

    const lista = document.getElementById("listaContasCasaFixas");

    if (!lista) return;

    if (contasCasaFixas.length === 0) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="house"></i>

            <p>Nenhuma conta fixa cadastrada.</p>

        </div>

        `;

        lucide.createIcons();

        return;

    }

    lista.innerHTML = "";

    contasCasaFixas.forEach(fixa => {

        lista.innerHTML += `

        <div class="conta-fixa-item">

            <div class="conta-fixa-info">

                <h4>${fixa.nome}</h4>

                <p>${fixa.categoria} • Vence dia ${fixa.diaVencimento} • R$ ${fixa.valorPadrao.toFixed(2)}</p>

            </div>

            <button class="delete-button" onclick="excluirContaCasaFixa(${fixa.id})">Excluir</button>

        </div>

        `;

    });

    lucide.createIcons();

}

// ================================
// Excluir Conta Fixa
// ================================

function excluirContaCasaFixa(id) {

    if (!confirm("Excluir esta conta fixa? O histórico já gerado será mantido, mas ela deixará de se repetir nos próximos meses.")) return;

    contasCasaFixas = contasCasaFixas.filter(c => c.id !== id);

    salvarLocalContasCasaFixas();

    listarContasCasaFixas();

}

// ================================
// Gerar automaticamente os lançamentos do mês atual
// ================================

function gerarLancamentosMesAtual() {

    const mesAtual = mesAtualCasaStr();

    contasCasaFixas.forEach(fixa => {

        const jaExiste = lancamentosCasa.some(l => l.contaCasaId === fixa.id && l.mesReferencia === mesAtual);

        if (!jaExiste) {

            const dia = String(fixa.diaVencimento).padStart(2, "0");

            lancamentosCasa.push({

                id: Date.now() + Math.floor(Math.random() * 1000),

                contaCasaId: fixa.id,

                nome: fixa.nome,

                categoria: fixa.categoria,

                valor: fixa.valorPadrao,

                mesReferencia: mesAtual,

                vencimento: `${mesAtual}-${dia}`,

                paga: false,

                dataPagamento: null

            });

        }

    });

    salvarLocalLancamentosCasa();

}

// ================================
// Popular meses disponíveis
// ================================

function popularMesesCasa() {

    const select = document.getElementById("mesCasaSelect");

    if (!select) return;

    const mesAtual = mesAtualCasaStr();

    const meses = new Set(lancamentosCasa.map(l => l.mesReferencia));

    meses.add(mesAtual);

    const mesesOrdenados = Array.from(meses).sort();

    const selecionadoAnterior = select.value;

    select.innerHTML = mesesOrdenados

        .map(mes => `<option value="${mes}">${formatarMesCasa(mes)}</option>`)

        .join("");

    select.value = mesesOrdenados.includes(selecionadoAnterior) ? selecionadoAnterior : mesAtual;

    listarLancamentosCasa();

}

// ================================
// Popular select de contas (para pagamento)
// ================================

function popularContasPagamentoCasa() {

    const select = document.getElementById("contaPagamentoCasa");

    if (!select) return;

    const listaContas = (typeof contas !== "undefined") ? contas : [];

    const selecionadoAnterior = select.value;

    select.innerHTML = '<option value="">Selecione uma conta</option>';

    listaContas.forEach(conta => {

        select.innerHTML += `<option value="${conta.id}">${conta.nome}</option>`;

    });

    if (listaContas.some(c => String(c.id) === selecionadoAnterior)) {

        select.value = selecionadoAnterior;

    }

}

// ================================
// Listar Lançamentos do Mês Selecionado
// ================================

function listarLancamentosCasa() {

    const lista = document.getElementById("listaLancamentosCasa");

    const totalElemento = document.getElementById("totalPendenteCasa");

    if (!lista) return;

    const mesReferencia = document.getElementById("mesCasaSelect").value;

    if (!mesReferencia) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="receipt"></i>

            <p>Selecione um mês.</p>

        </div>

        `;

        if (totalElemento) totalElemento.innerHTML = "R$ 0,00";

        lucide.createIcons();

        return;

    }

    const itens = lancamentosCasa

        .filter(l => l.mesReferencia === mesReferencia)

        .sort((a, b) => a.vencimento.localeCompare(b.vencimento));

    if (itens.length === 0) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="receipt"></i>

            <p>Nenhuma conta neste mês.</p>

        </div>

        `;

        if (totalElemento) totalElemento.innerHTML = "R$ 0,00";

        lucide.createIcons();

        return;

    }

    let totalPendente = 0;

    lista.innerHTML = "";

    itens.forEach(item => {

        if (!item.paga) totalPendente += item.valor;

        const partesData = item.vencimento.split("-");

        const dataFormatada = `${partesData[2]}/${partesData[1]}`;

        lista.innerHTML += `

        <div class="lancamento-item">

            <div class="lancamento-info">

                <h4>${item.nome}</h4>

                <p>${item.categoria} • Vence ${dataFormatada}</p>

            </div>

            <div class="lancamento-acao">

                <strong>R$ ${item.valor.toFixed(2)}</strong>

                ${item.paga
                    ? `<span class="badge badge-pago">Pago</span>`
                    : `<span class="badge badge-pendente">Pendente</span><br><button class="pay-button" onclick="pagarContaCasa(${item.id})">Pagar</button>`
                }

            </div>

        </div>

        `;

    });

    if (totalElemento) {

        totalElemento.innerHTML = `R$ ${totalPendente.toFixed(2)}`;

    }

    lucide.createIcons();

}

// ================================
// Pagar Conta da Casa
// ================================

function pagarContaCasa(id) {

    const contaId = Number(document.getElementById("contaPagamentoCasa").value);

    if (!contaId) {

        alert("Selecione a conta para pagar.");

        return;

    }

    const lancamento = lancamentosCasa.find(l => l.id === id);

    if (!lancamento) return;

    if (lancamento.paga) {

        alert("Esta conta já está paga.");

        return;

    }

    const conta = contas.find(c => c.id === contaId);

    if (!conta) {

        alert("Conta não encontrada.");

        return;

    }

    if (!confirm(`Confirma o pagamento de R$ ${lancamento.valor.toFixed(2)} (${lancamento.nome}) com a conta ${conta.nome}?`)) {

        return;

    }

    conta.saldo -= lancamento.valor;

    if (typeof salvarLocal === "function") salvarLocal();

    lancamento.paga = true;

    lancamento.dataPagamento = new Date().toISOString().split("T")[0];

    salvarLocalLancamentosCasa();

    // Registra no histórico do Financeiro, se o módulo estiver carregado
    if (typeof movimentos !== "undefined") {

        movimentos.push({

            id: Date.now(),

            contaId: conta.id,

            contaNome: conta.nome,

            tipo: "saida",

            categoria: lancamento.categoria,

            valor: lancamento.valor,

            descricao: `${lancamento.nome} - ${formatarMesCasa(lancamento.mesReferencia)}`,

            data: new Date().toISOString().split("T")[0]

        });

        if (typeof salvarLocalMovimentos === "function") salvarLocalMovimentos();

    }

    listarLancamentosCasa();

    if (typeof listarContas === "function") listarContas();

    if (typeof listarMovimentos === "function") listarMovimentos();

    if (typeof atualizarDashboard === "function") atualizarDashboard();

}

// ================================
// Inicialização
// ================================

document.addEventListener("DOMContentLoaded", () => {

    gerarLancamentosMesAtual();

    popularContasPagamentoCasa();

    listarContasCasaFixas();

    popularMesesCasa();

});
