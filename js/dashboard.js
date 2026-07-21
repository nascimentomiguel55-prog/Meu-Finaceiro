// ================================
// Dashboard
// ================================

// ================================
// Utilitário: mês atual "yyyy-mm"
// ================================

function mesAtualDashboardStr() {

    const hoje = new Date();

    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

}

// ================================
// Utilitário: formatar valor em Real
// ================================

function formatarMoedaDashboard(valor) {

    return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

}

// ================================
// Cards de resumo (Saldo, Receitas, Despesas, Disponível)
// ================================

function calcularReceitasDespesasMes() {

    const mesAtual = mesAtualDashboardStr();

    let receitas = 0;

    let despesas = 0;

    if (typeof movimentos !== "undefined") {

        movimentos.forEach(mov => {

            if (mov.data && mov.data.startsWith(mesAtual)) {

                if (mov.tipo === "entrada") {

                    receitas += mov.valor;

                } else {

                    despesas += mov.valor;

                }

            }

        });

    }

    return { receitas, despesas };

}

function calcularComprometidoMes() {

    const mesAtual = mesAtualDashboardStr();

    let total = 0;

    if (typeof compras !== "undefined") {

        compras.forEach(compra => {

            compra.parcelas.forEach(parcela => {

                if (parcela.mesReferencia === mesAtual && !parcela.paga) {

                    total += parcela.valor;

                }

            });

        });

    }

    if (typeof lancamentosCasa !== "undefined") {

        lancamentosCasa.forEach(lancamento => {

            if (lancamento.mesReferencia === mesAtual && !lancamento.paga) {

                total += lancamento.valor;

            }

        });

    }

    return total;

}

function renderStatCards() {

    const total = (typeof saldoTotal === "function") ? saldoTotal() : 0;

    const { receitas, despesas } = calcularReceitasDespesasMes();

    const comprometido = calcularComprometidoMes();

    const disponivel = total - comprometido;

    const elSaldo = document.getElementById("saldoTotal");

    const elReceitas = document.getElementById("receitasMes");

    const elDespesas = document.getElementById("despesasMes");

    const elDisponivel = document.getElementById("disponivelMes");

    if (elSaldo) elSaldo.innerHTML = formatarMoedaDashboard(total);

    if (elReceitas) elReceitas.innerHTML = formatarMoedaDashboard(receitas);

    if (elDespesas) elDespesas.innerHTML = formatarMoedaDashboard(despesas);

    if (elDisponivel) elDisponivel.innerHTML = formatarMoedaDashboard(disponivel);

}

// ================================
// Resumo de Contas e Carteiras
// ================================

function renderResumoContas() {

    const div = document.getElementById("resumoContas");

    if (!div) return;

    const lista = (typeof contas !== "undefined") ? contas : [];

    if (lista.length === 0) {

        div.innerHTML = `<div class="empty-mini"><p>Nenhuma conta cadastrada.</p></div>`;

        return;

    }

    div.innerHTML = lista.slice(0, 5).map(conta => `

        <div class="resumo-item">

            <div class="resumo-item-icon">
                <i data-lucide="landmark"></i>
            </div>

            <div class="resumo-item-info">
                <h4>${conta.nome}</h4>
                <p>${conta.tipo}</p>
            </div>

            <strong>R$ ${conta.saldo.toFixed(2)}</strong>

        </div>

    `).join("");

    lucide.createIcons();

}

// ================================
// Próximos Vencimentos (Casa + Faturas de Cartão)
// ================================

function renderVencimentos() {

    const div = document.getElementById("resumoVencimentos");

    if (!div) return;

    const itens = [];

    if (typeof lancamentosCasa !== "undefined") {

        lancamentosCasa.filter(l => !l.paga).forEach(l => {

            itens.push({

                nome: l.nome,

                valor: l.valor,

                vencimento: l.vencimento

            });

        });

    }

    if (typeof compras !== "undefined" && typeof cartoes !== "undefined") {

        const faturaAgrupada = {};

        compras.forEach(compra => {

            compra.parcelas.forEach(parcela => {

                if (!parcela.paga) {

                    const chave = `${compra.cartaoId}_${parcela.mesReferencia}`;

                    if (!faturaAgrupada[chave]) {

                        faturaAgrupada[chave] = {

                            cartaoId: compra.cartaoId,

                            mesReferencia: parcela.mesReferencia,

                            valor: 0

                        };

                    }

                    faturaAgrupada[chave].valor += parcela.valor;

                }

            });

        });

        Object.values(faturaAgrupada).forEach(grupo => {

            const cartao = cartoes.find(c => c.id === grupo.cartaoId);

            const diaVencimento = cartao ? String(cartao.vencimento).padStart(2, "0") : "01";

            itens.push({

                nome: `Fatura ${cartao ? cartao.nome : "Cartão"}`,

                valor: grupo.valor,

                vencimento: `${grupo.mesReferencia}-${diaVencimento}`

            });

        });

    }

    if (itens.length === 0) {

        div.innerHTML = `<div class="empty-mini"><p>Nenhum vencimento pendente.</p></div>`;

        return;

    }

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    itens.sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento));

    div.innerHTML = itens.slice(0, 5).map(item => {

        const dataVencimento = new Date(item.vencimento + "T00:00:00");

        const diffDias = Math.round((dataVencimento - hoje) / 86400000);

        const partes = item.vencimento.split("-");

        const dataFormatada = `${partes[2]}/${partes[1]}`;

        let textoStatus = `Faltam ${diffDias} dias`;

        let classeStatus = "";

        if (diffDias < 0) {

            textoStatus = `Atrasado ${Math.abs(diffDias)}d`;

            classeStatus = "atrasado";

        } else if (diffDias === 0) {

            textoStatus = "Vence hoje";

            classeStatus = "atrasado";

        }

        return `

        <div class="vencimento-item">

            <div class="vencimento-icon">
                <i data-lucide="calendar-clock"></i>
            </div>

            <div class="vencimento-info">
                <h4>${item.nome}</h4>
                <p>${dataFormatada}</p>
            </div>

            <div class="vencimento-valor">
                <strong>R$ ${item.valor.toFixed(2)}</strong>
                <span class="${classeStatus}">${textoStatus}</span>
            </div>

        </div>

        `;

    }).join("");

    lucide.createIcons();

}

// ================================
// Anéis de Limite dos Cartões
// ================================

function renderRingsCartoes() {

    const div = document.getElementById("ringsCartoes");

    if (!div) return;

    const lista = (typeof cartoes !== "undefined") ? cartoes : [];

    if (lista.length === 0) {

        div.innerHTML = `<div class="empty-mini"><p>Nenhum cartão cadastrado.</p></div>`;

        return;

    }

    div.innerHTML = lista.map(cartao => {

        const usado = cartao.limite - cartao.limiteDisponivel;

        const percentual = cartao.limite > 0 ? Math.min(100, Math.round((usado / cartao.limite) * 100)) : 0;

        return `

        <div class="ring-item">

            <div class="ring" style="--pct:${percentual};--cor:${cartao.cor}">
                <div class="ring-inner">${percentual}%</div>
            </div>

            <span>${cartao.nome}</span>

        </div>

        `;

    }).join("");

}

// ================================
// Dica do dia
// ================================

function renderDicaDoDia() {

    const elemento = document.getElementById("dicaDoDia");

    if (!elemento) return;

    const dicas = [

        "Anote todo gasto, até os pequenos — eles somam mais do que parece.",

        "Revise suas assinaturas mensais: cancelar uma economiza no ano todo.",

        "Antes de parcelar, pergunte: eu compraria isso à vista?",

        "Separar uma reserva de emergência traz mais tranquilidade que qualquer investimento.",

        "Compare preços no mercado — pequenas diferenças por item somam no fim do mês.",

        "Pague suas contas fixas assim que possível para não esquecer o vencimento.",

        "Defina um valor fixo para lazer todo mês — evita culpa e evita excesso."

    ];

    const dia = new Date().getDate();

    elemento.innerHTML = dicas[dia % dicas.length];

}

// ================================
// Atualização completa do Dashboard
// ================================

function atualizarDashboardCompleto() {

    renderStatCards();

    renderResumoContas();

    renderVencimentos();

    renderRingsCartoes();

    renderDicaDoDia();

}
