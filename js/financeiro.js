// ================================
// Movimentações Financeiras
// ================================

let movimentos = JSON.parse(localStorage.getItem("movimentos")) || [];

// ================================
// Popular select de contas
// ================================

function popularContasMovimento() {

    const select = document.getElementById("contaMovimento");

    if (!select) return;

    const listaContas = (typeof contas !== "undefined") ? contas : [];

    select.innerHTML = '<option value="">Selecione uma conta</option>';

    listaContas.forEach(conta => {

        select.innerHTML += `<option value="${conta.id}">${conta.nome}</option>`;

    });

}

// ================================
// Salvar Movimentação
// ================================

function salvarMovimentacao() {

    const contaId = document.getElementById("contaMovimento").value;

    const tipo = document.getElementById("tipoMovimento").value;

    const categoria = document.getElementById("categoriaMovimento").value;

    const valor = parseFloat(document.getElementById("valorMovimento").value) || 0;

    const descricao = document.getElementById("descricaoMovimento").value.trim();

    const data = document.getElementById("dataMovimento").value;

    if (contaId === "") {

        alert("Selecione uma conta.");

        return;

    }

    if (valor <= 0) {

        alert("Informe um valor válido.");

        return;

    }

    if (data === "") {

        alert("Informe a data.");

        return;

    }

    const conta = contas.find(c => c.id === Number(contaId));

    if (!conta) {

        alert("Conta não encontrada.");

        return;

    }

    if (tipo === "entrada") {

        conta.saldo += valor;

    } else {

        conta.saldo -= valor;

    }

    movimentos.push({

        id: Date.now(),

        contaId: conta.id,

        contaNome: conta.nome,

        tipo,

        categoria,

        valor,

        descricao,

        data

    });

    salvarLocalMovimentos();

    if (typeof salvarLocal === "function") {

        salvarLocal();

    }

    limparFormularioMovimento();

    listarMovimentos();

    if (typeof listarContas === "function") listarContas();

    if (typeof atualizarDashboard === "function") atualizarDashboard();

}

// ================================
// Salvar no LocalStorage
// ================================

function salvarLocalMovimentos() {

    localStorage.setItem("movimentos", JSON.stringify(movimentos));

}

// ================================
// Listar Movimentações
// ================================

function listarMovimentos() {

    const lista = document.getElementById("listaMovimentos");

    if (!lista) return;

    if (movimentos.length === 0) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="receipt-text"></i>

            <p>Nenhuma movimentação cadastrada.</p>

        </div>

        `;

        lucide.createIcons();

        return;

    }

    const ordenados = [...movimentos].sort((a, b) => new Date(b.data) - new Date(a.data));

    lista.innerHTML = "";

    ordenados.forEach(mov => {

        const sinal = mov.tipo === "entrada" ? "+" : "-";

        const classe = mov.tipo === "entrada" ? "entrada" : "saida";

        const dataFormatada = formatarData(mov.data);

        lista.innerHTML += `

        <div class="movimento">

            <div class="movimento-info">

                <h4>${mov.categoria}</h4>

                <p>${mov.contaNome} • ${dataFormatada}${mov.descricao ? " • " + mov.descricao : ""}</p>

            </div>

            <div style="text-align:right;">

                <div class="valor ${classe}">${sinal} R$ ${mov.valor.toFixed(2)}</div>

                <button class="delete-button" onclick="excluirMovimento(${mov.id})">Excluir</button>

            </div>

        </div>

        `;

    });

    lucide.createIcons();

}

// ================================
// Excluir Movimentação
// ================================

function excluirMovimento(id) {

    if (!confirm("Deseja excluir esta movimentação?")) return;

    const mov = movimentos.find(m => m.id === id);

    if (!mov) return;

    const conta = contas.find(c => c.id === mov.contaId);

    if (conta) {

        if (mov.tipo === "entrada") {

            conta.saldo -= mov.valor;

        } else {

            conta.saldo += mov.valor;

        }

        if (typeof salvarLocal === "function") salvarLocal();

    }

    movimentos = movimentos.filter(m => m.id !== id);

    salvarLocalMovimentos();

    listarMovimentos();

    if (typeof listarContas === "function") listarContas();

    if (typeof atualizarDashboard === "function") atualizarDashboard();

}

// ================================
// Limpar Formulário
// ================================

function limparFormularioMovimento() {

    document.getElementById("valorMovimento").value = "";

    document.getElementById("descricaoMovimento").value = "";

    document.getElementById("dataMovimento").value = new Date().toISOString().split("T")[0];

}

// ================================
// Utilitário: formatar data (yyyy-mm-dd -> dd/mm)
// ================================

function formatarData(dataStr) {

    if (!dataStr) return "";

    const partes = dataStr.split("-");

    if (partes.length !== 3) return dataStr;

    return `${partes[2]}/${partes[1]}`;

}

// ================================
// Inicialização
// ================================

document.addEventListener("DOMContentLoaded", () => {

    popularContasMovimento();

    listarMovimentos();

    const campoData = document.getElementById("dataMovimento");

    if (campoData && !campoData.value) {

        campoData.value = new Date().toISOString().split("T")[0];

    }

});
