// ================================
// Mercado
// ================================

let listaMercadoAtual = JSON.parse(localStorage.getItem("listaMercadoAtual")) || [];

let comprasMercado = JSON.parse(localStorage.getItem("comprasMercado")) || [];

// ================================
// Salvar Item na Lista
// ================================

function salvarItemMercado() {

    const produto = document.getElementById("nomeProdutoMercado").value.trim();

    const categoria = document.getElementById("categoriaMercado").value;

    const quantidade = parseFloat(document.getElementById("quantidadeMercado").value) || 0;

    const precoUnitario = parseFloat(document.getElementById("precoMercado").value) || 0;

    if (produto === "") {

        alert("Informe o nome do produto.");

        return;

    }

    if (quantidade <= 0) {

        alert("Informe uma quantidade válida.");

        return;

    }

    if (precoUnitario <= 0) {

        alert("Informe um preço válido.");

        return;

    }

    listaMercadoAtual.push({

        id: Date.now(),

        produto,

        categoria,

        quantidade,

        precoUnitario

    });

    salvarLocalListaMercado();

    limparFormularioItemMercado();

    listarItensMercado();

}

// ================================
// Salvar LocalStorage
// ================================

function salvarLocalListaMercado() {

    localStorage.setItem("listaMercadoAtual", JSON.stringify(listaMercadoAtual));

}

function salvarLocalComprasMercado() {

    localStorage.setItem("comprasMercado", JSON.stringify(comprasMercado));

}

// ================================
// Limpar Formulário
// ================================

function limparFormularioItemMercado() {

    document.getElementById("nomeProdutoMercado").value = "";

    document.getElementById("quantidadeMercado").value = "1";

    document.getElementById("precoMercado").value = "";

}

// ================================
// Histórico de preço de um produto
// (procura em todas as compras já finalizadas)
// ================================

function historicoProdutoMercado(nomeProduto) {

    const nomeNormalizado = nomeProduto.trim().toLowerCase();

    let menor = null;

    let ultimo = null;

    let ultimaData = null;

    comprasMercado.forEach(compra => {

        compra.itens.forEach(item => {

            if (item.produto.trim().toLowerCase() === nomeNormalizado) {

                if (menor === null || item.precoUnitario < menor) {

                    menor = item.precoUnitario;

                }

                if (ultimaData === null || compra.data > ultimaData) {

                    ultimaData = compra.data;

                    ultimo = item.precoUnitario;

                }

            }

        });

    });

    return { menor, ultimo, ultimaData };

}

// ================================
// Gerar HTML da comparação de preço
// ================================

function gerarComparacaoHtml(precoAtual, historico) {

    if (historico.ultimo === null) {

        return `<div class="comparacao comparacao-nova">🆕 Primeira vez comprando este produto</div>`;

    }

    const diferenca = precoAtual - historico.ultimo;

    let textoComparacao = "";

    let classe = "comparacao-igual";

    if (diferenca > 0.001) {

        classe = "comparacao-alta";

        textoComparacao = `🔺 R$ ${diferenca.toFixed(2)} mais caro que da última vez (R$ ${historico.ultimo.toFixed(2)})`;

    } else if (diferenca < -0.001) {

        classe = "comparacao-baixa";

        textoComparacao = `🔻 R$ ${Math.abs(diferenca).toFixed(2)} mais barato que da última vez (R$ ${historico.ultimo.toFixed(2)})`;

    } else {

        textoComparacao = `Mesmo preço da última vez (R$ ${historico.ultimo.toFixed(2)})`;

    }

    let textoMenor = "";

    if (historico.menor !== null && Math.abs(historico.menor - precoAtual) > 0.001) {

        textoMenor = `<br>Menor preço já pago: R$ ${historico.menor.toFixed(2)}`;

    }

    return `<div class="comparacao ${classe}">${textoComparacao}${textoMenor}</div>`;

}

// ================================
// Listar Itens da Lista Atual
// ================================

function listarItensMercado() {

    const lista = document.getElementById("listaItensMercado");

    const totalElemento = document.getElementById("totalListaMercado");

    if (!lista) return;

    if (listaMercadoAtual.length === 0) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="shopping-cart"></i>

            <p>Sua lista está vazia.</p>

        </div>

        `;

        if (totalElemento) totalElemento.innerHTML = "R$ 0,00";

        lucide.createIcons();

        return;

    }

    let total = 0;

    lista.innerHTML = "";

    listaMercadoAtual.forEach(item => {

        const subtotal = item.quantidade * item.precoUnitario;

        total += subtotal;

        const historico = historicoProdutoMercado(item.produto);

        const comparacaoHtml = gerarComparacaoHtml(item.precoUnitario, historico);

        lista.innerHTML += `

        <div class="item-mercado">

            <div class="item-mercado-topo">

                <div class="item-mercado-info">

                    <h4>${item.produto}</h4>

                    <p>${item.categoria} • ${item.quantidade} x R$ ${item.precoUnitario.toFixed(2)}</p>

                </div>

                <div class="item-mercado-valor">

                    <strong>R$ ${subtotal.toFixed(2)}</strong>

                    <button class="delete-button" onclick="excluirItemMercado(${item.id})">Excluir</button>

                </div>

            </div>

            ${comparacaoHtml}

        </div>

        `;

    });

    if (totalElemento) {

        totalElemento.innerHTML = `R$ ${total.toFixed(2)}`;

    }

    lucide.createIcons();

}

// ================================
// Excluir Item da Lista
// ================================

function excluirItemMercado(id) {

    if (!confirm("Remover este item da lista?")) return;

    listaMercadoAtual = listaMercadoAtual.filter(i => i.id !== id);

    salvarLocalListaMercado();

    listarItensMercado();

}

// ================================
// Alternar entre Conta e VR na Finalização
// ================================

function alternarFormaPagamentoMercado() {

    const forma = document.getElementById("formaPagamentoMercado").value;

    const grupoConta = document.getElementById("grupoContaMercado");

    const grupoVr = document.getElementById("grupoVrMercado");

    if (grupoConta) grupoConta.style.display = forma === "conta" ? "flex" : "none";

    if (grupoVr) grupoVr.style.display = forma === "vr" ? "flex" : "none";

}

// ================================
// Popular select de VR
// ================================

function popularVrMercado() {

    const select = document.getElementById("vrPagamentoMercado");

    if (!select) return;

    const listaVr = (typeof vrCartoes !== "undefined") ? vrCartoes : [];

    const selecionadoAnterior = select.value;

    select.innerHTML = '<option value="">Selecione um vale</option>' +

        listaVr.map(v => `<option value="${v.id}">${v.nome}</option>`).join("");

    if (listaVr.some(v => String(v.id) === selecionadoAnterior)) {

        select.value = selecionadoAnterior;

    }

}

// ================================
// Popular select de contas
// ================================

function popularContasMercado() {

    const select = document.getElementById("contaPagamentoMercado");

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
// Finalizar Compra
// ================================

function finalizarCompraMercado() {

    if (listaMercadoAtual.length === 0) {

        alert("Sua lista está vazia.");

        return;

    }

    const forma = document.getElementById("formaPagamentoMercado").value;

    const valorTotal = listaMercadoAtual.reduce((soma, item) => soma + (item.quantidade * item.precoUnitario), 0);

    let contaId = null;

    let contaNome = null;

    let vrId = null;

    let vrNome = null;

    if (forma === "conta") {

        contaId = Number(document.getElementById("contaPagamentoMercado").value);

        if (!contaId) {

            alert("Selecione a conta para pagar.");

            return;

        }

        const conta = contas.find(c => c.id === contaId);

        if (!conta) {

            alert("Conta não encontrada.");

            return;

        }

        contaNome = conta.nome;

        if (!confirm(`Confirma a compra de R$ ${valorTotal.toFixed(2)} (${listaMercadoAtual.length} itens) com a conta ${conta.nome}?`)) {

            return;

        }

        conta.saldo -= valorTotal;

        if (typeof salvarLocal === "function") salvarLocal();

        // Registra no histórico do Financeiro (só faz sentido para contas bancárias)
        if (typeof movimentos !== "undefined") {

            movimentos.push({

                id: Date.now(),

                contaId: conta.id,

                contaNome: conta.nome,

                tipo: "saida",

                categoria: "Mercado",

                valor: valorTotal,

                descricao: `Compras no mercado (${listaMercadoAtual.length} itens)`,

                data: new Date().toISOString().split("T")[0]

            });

            if (typeof salvarLocalMovimentos === "function") salvarLocalMovimentos();

        }

    } else {

        vrId = Number(document.getElementById("vrPagamentoMercado").value);

        if (!vrId) {

            alert("Selecione o vale alimentação para pagar.");

            return;

        }

        if (typeof vrCartoes === "undefined") {

            alert("Módulo de Vale Alimentação não está carregado.");

            return;

        }

        const vr = vrCartoes.find(v => v.id === vrId);

        if (!vr) {

            alert("Vale não encontrado.");

            return;

        }

        if (valorTotal > vr.saldo) {

            alert(`Saldo do VR insuficiente. Saldo disponível: R$ ${vr.saldo.toFixed(2)}`);

            return;

        }

        vrNome = vr.nome;

        if (!confirm(`Confirma a compra de R$ ${valorTotal.toFixed(2)} (${listaMercadoAtual.length} itens) com o vale ${vr.nome}?`)) {

            return;

        }

        vr.saldo -= valorTotal;

        if (typeof salvarLocalVrCartoes === "function") salvarLocalVrCartoes();

        if (typeof vrCompras !== "undefined") {

            vrCompras.push({

                id: Date.now(),

                vrId: vr.id,

                descricao: `Compras no mercado (${listaMercadoAtual.length} itens)`,

                valor: valorTotal,

                data: new Date().toISOString().split("T")[0]

            });

            if (typeof salvarLocalVrCompras === "function") salvarLocalVrCompras();

        }

    }

    // Registra a compra no histórico do Mercado (usado para comparação de preços)
    comprasMercado.push({

        id: Date.now(),

        data: new Date().toISOString().split("T")[0],

        formaPagamento: forma,

        contaId,

        contaNome,

        vrId,

        vrNome,

        valorTotal,

        itens: listaMercadoAtual.map(item => ({

            produto: item.produto,

            categoria: item.categoria,

            quantidade: item.quantidade,

            precoUnitario: item.precoUnitario,

            precoTotal: item.quantidade * item.precoUnitario

        }))

    });

    salvarLocalComprasMercado();

    // Limpa a lista atual
    listaMercadoAtual = [];

    salvarLocalListaMercado();

    listarItensMercado();

    listarHistoricoMercado();

    if (typeof listarContas === "function") listarContas();

    if (typeof listarMovimentos === "function") listarMovimentos();

    if (typeof listarVr === "function") listarVr();

    if (typeof listarHistoricoVr === "function") listarHistoricoVr();

    if (typeof atualizarDashboard === "function") atualizarDashboard();

}

// ================================
// Utilitário: formatar data yyyy-mm-dd -> dd/mm/yyyy
// ================================

function formatarDataMercado(dataStr) {

    if (!dataStr) return "";

    const partes = dataStr.split("-");

    if (partes.length !== 3) return dataStr;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

// ================================
// Listar Histórico de Compras
// ================================

function listarHistoricoMercado() {

    const lista = document.getElementById("listaHistoricoMercado");

    if (!lista) return;

    if (comprasMercado.length === 0) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="history"></i>

            <p>Nenhuma compra finalizada ainda.</p>

        </div>

        `;

        lucide.createIcons();

        return;

    }

    const ordenadas = [...comprasMercado].sort((a, b) => new Date(b.data) - new Date(a.data));

    lista.innerHTML = "";

    ordenadas.slice(0, 10).forEach(compra => {

        const formaTexto = compra.formaPagamento === "vr"
            ? (compra.vrNome || "VR")
            : (compra.contaNome || "Conta");

        lista.innerHTML += `

        <div class="historico-compra-item">

            <div>

                <h4>${formatarDataMercado(compra.data)}</h4>

                <p>${compra.itens.length} itens • ${formaTexto}</p>

            </div>

            <strong>R$ ${compra.valorTotal.toFixed(2)}</strong>

        </div>

        `;

    });

    lucide.createIcons();

}

// ================================
// Inicialização
// ================================

document.addEventListener("DOMContentLoaded", () => {

    listarItensMercado();

    popularContasMercado();

    popularVrMercado();

    listarHistoricoMercado();

});
