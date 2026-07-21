// ================================
// Cartões de Crédito
// ================================

let cartoes = JSON.parse(localStorage.getItem("cartoes")) || [];

let compras = JSON.parse(localStorage.getItem("comprasCartao")) || [];

// ================================
// Salvar Cartão
// ================================

function salvarCartao() {

    const nome = document.getElementById("nomeCartao").value.trim();

    const banco = document.getElementById("bancoCartao").value.trim();

    const bandeira = document.getElementById("bandeiraCartao").value;

    const limite = parseFloat(document.getElementById("limiteCartao").value) || 0;

    const fechamento = parseInt(document.getElementById("fechamentoCartao").value);

    const vencimento = parseInt(document.getElementById("vencimentoCartao").value);

    const cor = document.getElementById("corCartao").value;

    if (nome === "") {

        alert("Informe o nome do cartão.");

        return;

    }

    if (limite <= 0) {

        alert("Informe um limite válido.");

        return;

    }

    if (!fechamento || fechamento < 1 || fechamento > 31) {

        alert("Informe um dia de fechamento válido (1 a 31).");

        return;

    }

    if (!vencimento || vencimento < 1 || vencimento > 31) {

        alert("Informe um dia de vencimento válido (1 a 31).");

        return;

    }

    cartoes.push({

        id: Date.now(),

        nome,

        banco,

        bandeira,

        limite,

        limiteDisponivel: limite,

        fechamento,

        vencimento,

        cor

    });

    salvarLocalCartoes();

    limparFormularioCartao();

    listarCartoes();

    popularSelectCartoes();

}

// ================================
// Salvar LocalStorage
// ================================

function salvarLocalCartoes() {

    localStorage.setItem("cartoes", JSON.stringify(cartoes));

}

function salvarLocalCompras() {

    localStorage.setItem("comprasCartao", JSON.stringify(compras));

}

// ================================
// Listar Cartões
// ================================

function listarCartoes() {

    const lista = document.getElementById("listaCartoes");

    if (!lista) return;

    if (cartoes.length === 0) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="credit-card"></i>

            <p>Nenhum cartão cadastrado.</p>

        </div>

        `;

        lucide.createIcons();

        return;

    }

    lista.innerHTML = "";

    cartoes.forEach(cartao => {

        const usado = cartao.limite - cartao.limiteDisponivel;

        const percentual = cartao.limite > 0 ? Math.min(100, (usado / cartao.limite) * 100) : 0;

        lista.innerHTML += `

        <div class="cartao-item" style="border-left-color:${cartao.cor}">

            <div class="cartao-item-header">

                <div>
                    <h4>${cartao.nome}</h4>
                    <p>${cartao.banco} • ${cartao.bandeira}</p>
                </div>

                <button class="delete-button" onclick="excluirCartao(${cartao.id})">Excluir</button>

            </div>

            <div class="limite-barra">
                <div class="limite-barra-preenchido" style="width:${percentual}%;background:${cartao.cor}"></div>
            </div>

            <div class="limite-info">
                <span>Usado: R$ ${usado.toFixed(2)}</span>
                <span>Disponível: R$ ${cartao.limiteDisponivel.toFixed(2)}</span>
            </div>

            <p>Fecha dia ${cartao.fechamento} • Vence dia ${cartao.vencimento}</p>

        </div>

        `;

    });

    lucide.createIcons();

}

// ================================
// Excluir Cartão
// ================================

function excluirCartao(id) {

    if (!confirm("Excluir este cartão? Todas as compras associadas também serão removidas.")) return;

    cartoes = cartoes.filter(c => c.id !== id);

    compras = compras.filter(c => c.cartaoId !== id);

    salvarLocalCartoes();

    salvarLocalCompras();

    listarCartoes();

    popularSelectCartoes();

    popularMesesFatura();

}

// ================================
// Limpar Formulário Cartão
// ================================

function limparFormularioCartao() {

    document.getElementById("nomeCartao").value = "";

    document.getElementById("bancoCartao").value = "";

    document.getElementById("limiteCartao").value = "";

    document.getElementById("fechamentoCartao").value = "";

    document.getElementById("vencimentoCartao").value = "";

}

// ================================
// Popular selects de cartões
// ================================

function popularSelectCartoes() {

    const selectCompra = document.getElementById("compraCartao");

    const selectFatura = document.getElementById("faturaCartaoSelect");

    const opcoes = '<option value="">Selecione um cartão</option>' +
        cartoes.map(c => `<option value="${c.id}">${c.nome}</option>`).join("");

    if (selectCompra) selectCompra.innerHTML = opcoes;

    if (selectFatura) selectFatura.innerHTML = opcoes;

}

// ================================
// Popular select de contas (para pagar fatura)
// ================================

function popularContasFatura() {

    const select = document.getElementById("contaPagamentoFatura");

    if (!select) return;

    const listaContas = (typeof contas !== "undefined") ? contas : [];

    select.innerHTML = '<option value="">Selecione uma conta</option>';

    listaContas.forEach(conta => {

        select.innerHTML += `<option value="${conta.id}">${conta.nome}</option>`;

    });

}

// ================================
// Utilitário: soma de meses a uma referência "yyyy-mm"
// ================================

function addMeses(mesReferencia, quantidade) {

    const [ano, mes] = mesReferencia.split("-").map(Number);

    const totalMeses = (mes - 1) + quantidade;

    const anoFinal = ano + Math.floor(totalMeses / 12);

    const mesFinal = (totalMeses % 12) + 1;

    return `${anoFinal}-${String(mesFinal).padStart(2, "0")}`;

}

// ================================
// Utilitário: calcula em qual fatura a 1ª parcela cai
// ================================

function calcularMesInicial(dataCompraStr, diaFechamento) {

    const data = new Date(dataCompraStr + "T00:00:00");

    const diaCompra = data.getDate();

    // Se comprou depois do fechamento, a compra só entra 2 meses depois
    const offset = diaCompra > diaFechamento ? 2 : 1;

    const ano = data.getFullYear();

    const mes = data.getMonth() + 1; // 1-12

    return addMeses(`${ano}-${String(mes).padStart(2, "0")}`, offset - 1);

}

// ================================
// Utilitário: formatar "yyyy-mm" para "Mês/Ano"
// ================================

function formatarMesReferencia(mesReferencia) {

    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const [ano, mes] = mesReferencia.split("-").map(Number);

    return `${meses[mes - 1]}/${ano}`;

}

// ================================
// Salvar Compra (com parcelamento)
// ================================

function salvarCompra() {

    const cartaoId = Number(document.getElementById("compraCartao").value);

    const descricao = document.getElementById("descricaoCompra").value.trim();

    const categoria = document.getElementById("categoriaCompra").value;

    const valorTotal = parseFloat(document.getElementById("valorCompra").value) || 0;

    const numParcelas = parseInt(document.getElementById("parcelasCompra").value) || 1;

    const dataCompra = document.getElementById("dataCompra").value;

    if (!cartaoId) {

        alert("Selecione um cartão.");

        return;

    }

    if (descricao === "") {

        alert("Informe uma descrição para a compra.");

        return;

    }

    if (valorTotal <= 0) {

        alert("Informe um valor válido.");

        return;

    }

    if (dataCompra === "") {

        alert("Informe a data da compra.");

        return;

    }

    const cartao = cartoes.find(c => c.id === cartaoId);

    if (!cartao) {

        alert("Cartão não encontrado.");

        return;

    }

    if (valorTotal > cartao.limiteDisponivel) {

        alert(`Limite disponível insuficiente. Disponível: R$ ${cartao.limiteDisponivel.toFixed(2)}`);

        return;

    }

    // Calcula o mês da 1ª parcela
    const mesInicial = calcularMesInicial(dataCompra, cartao.fechamento);

    // Calcula o valor de cada parcela, ajustando a última para não perder centavos
    const valorParcelaBase = Math.floor((valorTotal / numParcelas) * 100) / 100;

    const parcelas = [];

    for (let i = 0; i < numParcelas; i++) {

        const ultima = i === numParcelas - 1;

        const valorParcela = ultima
            ? Math.round((valorTotal - valorParcelaBase * (numParcelas - 1)) * 100) / 100
            : valorParcelaBase;

        parcelas.push({

            numero: i + 1,

            valor: valorParcela,

            mesReferencia: addMeses(mesInicial, i),

            paga: false

        });

    }

    compras.push({

        id: Date.now(),

        cartaoId: cartao.id,

        cartaoNome: cartao.nome,

        descricao,

        categoria,

        valorTotal,

        numParcelas,

        dataCompra,

        parcelas

    });

    // O limite é comprometido integralmente no momento da compra
    cartao.limiteDisponivel -= valorTotal;

    salvarLocalCompras();

    salvarLocalCartoes();

    limparFormularioCompra();

    listarCartoes();

    popularMesesFatura();

}

// ================================
// Limpar Formulário Compra
// ================================

function limparFormularioCompra() {

    document.getElementById("descricaoCompra").value = "";

    document.getElementById("valorCompra").value = "";

    document.getElementById("parcelasCompra").value = "1";

}

// ================================
// Popular meses disponíveis na fatura do cartão selecionado
// ================================

function popularMesesFatura() {

    const selectCartao = document.getElementById("faturaCartaoSelect");

    const selectMes = document.getElementById("faturaMesSelect");

    if (!selectCartao || !selectMes) return;

    const cartaoId = Number(selectCartao.value);

    if (!cartaoId) {

        selectMes.innerHTML = '<option value="">Selecione o mês</option>';

        listarFatura();

        return;

    }

    const mesesEncontrados = new Set();

    compras.filter(c => c.cartaoId === cartaoId).forEach(c => {

        c.parcelas.forEach(p => mesesEncontrados.add(p.mesReferencia));

    });

    const mesesOrdenados = Array.from(mesesEncontrados).sort();

    if (mesesOrdenados.length === 0) {

        selectMes.innerHTML = '<option value="">Nenhuma fatura ainda</option>';

        listarFatura();

        return;

    }

    selectMes.innerHTML = mesesOrdenados
        .map(mes => `<option value="${mes}">${formatarMesReferencia(mes)}</option>`)
        .join("");

    listarFatura();

}

// ================================
// Listar Fatura (compras do cartão + mês selecionados)
// ================================

function listarFatura() {

    const lista = document.getElementById("listaFatura");

    const totalElemento = document.getElementById("totalFatura");

    if (!lista) return;

    const cartaoId = Number(document.getElementById("faturaCartaoSelect").value);

    const mesReferencia = document.getElementById("faturaMesSelect").value;

    if (!cartaoId || !mesReferencia) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="receipt"></i>

            <p>Selecione um cartão e um mês.</p>

        </div>

        `;

        if (totalElemento) totalElemento.innerHTML = "R$ 0,00";

        lucide.createIcons();

        return;

    }

    const itens = [];

    compras.filter(c => c.cartaoId === cartaoId).forEach(compra => {

        compra.parcelas.forEach(parcela => {

            if (parcela.mesReferencia === mesReferencia) {

                itens.push({

                    descricao: compra.descricao,

                    numero: parcela.numero,

                    numParcelas: compra.numParcelas,

                    valor: parcela.valor,

                    paga: parcela.paga

                });

            }

        });

    });

    if (itens.length === 0) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="receipt"></i>

            <p>Nenhuma compra nesta fatura.</p>

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

        lista.innerHTML += `

        <div class="fatura-item">

            <div class="fatura-item-info">

                <h4>${item.descricao}</h4>

                <p>Parcela ${item.numero}/${item.numParcelas}</p>

            </div>

            <div class="fatura-item-valor">

                <strong>R$ ${item.valor.toFixed(2)}</strong>

                <span class="badge ${item.paga ? "badge-pago" : "badge-pendente"}">
                    ${item.paga ? "Pago" : "Pendente"}
                </span>

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
// Pagar Fatura
// ================================

function pagarFatura() {

    const cartaoId = Number(document.getElementById("faturaCartaoSelect").value);

    const mesReferencia = document.getElementById("faturaMesSelect").value;

    const contaId = Number(document.getElementById("contaPagamentoFatura").value);

    if (!cartaoId || !mesReferencia) {

        alert("Selecione o cartão e o mês da fatura.");

        return;

    }

    if (!contaId) {

        alert("Selecione a conta para pagar a fatura.");

        return;

    }

    const cartao = cartoes.find(c => c.id === cartaoId);

    const conta = contas.find(c => c.id === contaId);

    if (!cartao || !conta) {

        alert("Cartão ou conta não encontrados.");

        return;

    }

    // Calcula o total pendente desta fatura
    let total = 0;

    compras.filter(c => c.cartaoId === cartaoId).forEach(compra => {

        compra.parcelas.forEach(parcela => {

            if (parcela.mesReferencia === mesReferencia && !parcela.paga) {

                total += parcela.valor;

            }

        });

    });

    if (total <= 0) {

        alert("Não há valores pendentes nesta fatura.");

        return;

    }

    if (!confirm(`Confirma o pagamento de R$ ${total.toFixed(2)} da fatura de ${cartao.nome} (${formatarMesReferencia(mesReferencia)}) com a conta ${conta.nome}?`)) {

        return;

    }

    // Marca as parcelas como pagas
    compras.filter(c => c.cartaoId === cartaoId).forEach(compra => {

        compra.parcelas.forEach(parcela => {

            if (parcela.mesReferencia === mesReferencia && !parcela.paga) {

                parcela.paga = true;

            }

        });

    });

    // Debita da conta
    conta.saldo -= total;

    salvarLocalCompras();

    if (typeof salvarLocal === "function") salvarLocal();

    // Registra no histórico do Financeiro, se o módulo estiver carregado
    if (typeof movimentos !== "undefined") {

        movimentos.push({

            id: Date.now(),

            contaId: conta.id,

            contaNome: conta.nome,

            tipo: "saida",

            categoria: "Cartão de Crédito",

            valor: total,

            descricao: `Fatura ${cartao.nome} - ${formatarMesReferencia(mesReferencia)}`,

            data: new Date().toISOString().split("T")[0]

        });

        if (typeof salvarLocalMovimentos === "function") salvarLocalMovimentos();

    }

    listarFatura();

    listarCartoes();

    if (typeof listarContas === "function") listarContas();

    if (typeof listarMovimentos === "function") listarMovimentos();

    if (typeof atualizarDashboard === "function") atualizarDashboard();

}

// ================================
// Inicialização
// ================================

document.addEventListener("DOMContentLoaded", () => {

    popularSelectCartoes();

    listarCartoes();

    popularContasFatura();

    popularMesesFatura();

});
