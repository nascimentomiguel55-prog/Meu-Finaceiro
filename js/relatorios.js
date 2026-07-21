// ================================
// Relatórios
// ================================

// ================================
// Utilitário: mês atual "yyyy-mm"
// ================================

function mesAtualRelatorioStr() {

    const hoje = new Date();

    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

}

// ================================
// Utilitário: formatar "yyyy-mm" para "Mês/Ano"
// ================================

function formatarMesRelatorio(mesReferencia) {

    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const [ano, mes] = mesReferencia.split("-").map(Number);

    return `${meses[mes - 1]}/${ano}`;

}

// ================================
// Utilitário: somar/subtrair meses de uma referência "yyyy-mm"
// ================================

function addMesesRelatorio(mesReferencia, quantidade) {

    const [ano, mes] = mesReferencia.split("-").map(Number);

    const totalMeses = (mes - 1) + quantidade;

    const anoFinal = ano + Math.floor(totalMeses / 12);

    const mesFinal = ((totalMeses % 12) + 12) % 12 + 1;

    return `${anoFinal}-${String(mesFinal).padStart(2, "0")}`;

}

// ================================
// Utilitário: formatar valor em Real
// ================================

function formatarMoedaRelatorio(valor) {

    return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

}

function setTextoRelatorio(id, texto) {

    const elemento = document.getElementById(id);

    if (elemento) elemento.innerHTML = texto;

}

// ================================
// Alternar entre aba Mensal e Anual
// ================================

function alternarAbaRelatorio(aba) {

    const secaoMensal = document.getElementById("secaoMensal");

    const secaoAnual = document.getElementById("secaoAnual");

    const tabMensal = document.getElementById("tab-mensal");

    const tabAnual = document.getElementById("tab-anual");

    if (secaoMensal) secaoMensal.style.display = aba === "mensal" ? "block" : "none";

    if (secaoAnual) secaoAnual.style.display = aba === "anual" ? "block" : "none";

    if (tabMensal) tabMensal.classList.toggle("tab-ativa", aba === "mensal");

    if (tabAnual) tabAnual.classList.toggle("tab-ativa", aba === "anual");

}

// ================================
// Cálculos básicos
// ================================

function calcularResumoPeriodoRelatorio(movimentosFiltrados) {

    let receitas = 0;

    let despesas = 0;

    movimentosFiltrados.forEach(mov => {

        if (mov.tipo === "entrada") {

            receitas += mov.valor;

        } else {

            despesas += mov.valor;

        }

    });

    return { receitas, despesas, saldo: receitas - despesas };

}

function calcularCategoriasRelatorio(movimentosFiltrados, tipo) {

    const mapa = {};

    movimentosFiltrados.filter(mov => mov.tipo === tipo).forEach(mov => {

        mapa[mov.categoria] = (mapa[mov.categoria] || 0) + mov.valor;

    });

    return Object.entries(mapa)

        .map(([categoria, valor]) => ({ categoria, valor }))

        .sort((a, b) => b.valor - a.valor);

}

function renderBarrasCategoriasRelatorio(containerId, categorias, classeCor) {

    const div = document.getElementById(containerId);

    if (!div) return;

    if (categorias.length === 0) {

        div.innerHTML = `<div class="empty-mini"><p>Sem dados neste período.</p></div>`;

        return;

    }

    const total = categorias.reduce((soma, c) => soma + c.valor, 0);

    div.innerHTML = categorias.map(c => {

        const percentual = total > 0 ? Math.round((c.valor / total) * 100) : 0;

        return `

        <div class="categoria-item">

            <div class="categoria-topo">
                <span>${c.categoria}</span>
                <strong>R$ ${c.valor.toFixed(2)}</strong>
            </div>

            <div class="categoria-barra">
                <div class="categoria-barra-preenchido ${classeCor}" style="width:${percentual}%"></div>
            </div>

            <span class="categoria-percentual">${percentual}%</span>

        </div>

        `;

    }).join("");

}

// ================================
// Popular select de Meses
// ================================

function popularMesesRelatorio() {

    const select = document.getElementById("mesRelatorioSelect");

    if (!select) return;

    const listaMovimentos = (typeof movimentos !== "undefined") ? movimentos : [];

    const mesAtual = mesAtualRelatorioStr();

    const meses = new Set();

    listaMovimentos.forEach(mov => {

        if (mov.data) meses.add(mov.data.slice(0, 7));

    });

    meses.add(mesAtual);

    const ordenados = Array.from(meses).sort().reverse();

    const selecionadoAnterior = select.value;

    select.innerHTML = ordenados.map(mes => `<option value="${mes}">${formatarMesRelatorio(mes)}</option>`).join("");

    select.value = ordenados.includes(selecionadoAnterior) ? selecionadoAnterior : mesAtual;

    renderRelatorioMensal();

}

// ================================
// Popular select de Anos
// ================================

function popularAnosRelatorio() {

    const select = document.getElementById("anoRelatorioSelect");

    if (!select) return;

    const listaMovimentos = (typeof movimentos !== "undefined") ? movimentos : [];

    const anoAtual = String(new Date().getFullYear());

    const anos = new Set();

    listaMovimentos.forEach(mov => {

        if (mov.data) anos.add(mov.data.slice(0, 4));

    });

    anos.add(anoAtual);

    const ordenados = Array.from(anos).sort().reverse();

    const selecionadoAnterior = select.value;

    select.innerHTML = ordenados.map(ano => `<option value="${ano}">${ano}</option>`).join("");

    select.value = ordenados.includes(selecionadoAnterior) ? selecionadoAnterior : anoAtual;

    renderRelatorioAnual();

}

// ================================
// Renderizar Relatório Mensal
// ================================

function renderRelatorioMensal() {

    const selectMes = document.getElementById("mesRelatorioSelect");

    if (!selectMes || !selectMes.value) return;

    const mes = selectMes.value;

    const listaMovimentos = (typeof movimentos !== "undefined") ? movimentos : [];

    const doMes = listaMovimentos.filter(mov => mov.data && mov.data.startsWith(mes));

    const resumo = calcularResumoPeriodoRelatorio(doMes);

    setTextoRelatorio("receitasMesRelatorio", formatarMoedaRelatorio(resumo.receitas));

    setTextoRelatorio("despesasMesRelatorio", formatarMoedaRelatorio(resumo.despesas));

    setTextoRelatorio("saldoMesRelatorio", formatarMoedaRelatorio(resumo.saldo));

    // Comparação com o mês anterior

    const mesAnterior = addMesesRelatorio(mes, -1);

    const doMesAnterior = listaMovimentos.filter(mov => mov.data && mov.data.startsWith(mesAnterior));

    const resumoAnterior = calcularResumoPeriodoRelatorio(doMesAnterior);

    const elementoComparacao = document.getElementById("comparacaoMesRelatorio");

    if (elementoComparacao) {

        if (resumoAnterior.despesas === 0) {

            elementoComparacao.innerHTML = `Sem dados de ${formatarMesRelatorio(mesAnterior)} para comparar.`;

        } else {

            const diferenca = resumo.despesas - resumoAnterior.despesas;

            const percentual = Math.round((diferenca / resumoAnterior.despesas) * 100);

            if (diferenca > 0) {

                elementoComparacao.innerHTML = `🔺 Você gastou ${percentual}% a mais que em ${formatarMesRelatorio(mesAnterior)}`;

            } else if (diferenca < 0) {

                elementoComparacao.innerHTML = `🔻 Você gastou ${Math.abs(percentual)}% a menos que em ${formatarMesRelatorio(mesAnterior)}`;

            } else {

                elementoComparacao.innerHTML = `Você gastou o mesmo valor que em ${formatarMesRelatorio(mesAnterior)}`;

            }

        }

    }

    const despesasCategorias = calcularCategoriasRelatorio(doMes, "saida");

    renderBarrasCategoriasRelatorio("categoriasDespesasMensal", despesasCategorias, "barra-despesa");

    const receitasCategorias = calcularCategoriasRelatorio(doMes, "entrada");

    renderBarrasCategoriasRelatorio("categoriasReceitasMensal", receitasCategorias, "barra-receita");

}

// ================================
// Renderizar Relatório Anual
// ================================

function renderRelatorioAnual() {

    const selectAno = document.getElementById("anoRelatorioSelect");

    if (!selectAno || !selectAno.value) return;

    const ano = selectAno.value;

    const listaMovimentos = (typeof movimentos !== "undefined") ? movimentos : [];

    const doAno = listaMovimentos.filter(mov => mov.data && mov.data.startsWith(ano));

    const resumo = calcularResumoPeriodoRelatorio(doAno);

    setTextoRelatorio("receitasAnoRelatorio", formatarMoedaRelatorio(resumo.receitas));

    setTextoRelatorio("despesasAnoRelatorio", formatarMoedaRelatorio(resumo.despesas));

    setTextoRelatorio("saldoAnoRelatorio", formatarMoedaRelatorio(resumo.saldo));

    const valoresPorMes = [];

    for (let m = 1; m <= 12; m++) {

        const mesStr = `${ano}-${String(m).padStart(2, "0")}`;

        const doMes = listaMovimentos.filter(mov => mov.data && mov.data.startsWith(mesStr));

        const despesasDoMes = doMes.filter(mov => mov.tipo === "saida").reduce((soma, mov) => soma + mov.valor, 0);

        valoresPorMes.push(despesasDoMes);

    }

    renderGraficoAnual(valoresPorMes);

    const despesasCategorias = calcularCategoriasRelatorio(doAno, "saida");

    renderBarrasCategoriasRelatorio("categoriasDespesasAnual", despesasCategorias, "barra-despesa");

}

// ================================
// Gráfico de barras (despesas por mês)
// ================================

function renderGraficoAnual(valores) {

    const div = document.getElementById("graficoAnual");

    if (!div) return;

    const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    const maximo = Math.max(...valores, 1);

    div.innerHTML = valores.map((valor, indice) => {

        const alturaPercentual = Math.round((valor / maximo) * 100);

        return `

        <div class="barra-mes-item">

            <div class="barra-mes-coluna">
                <div class="barra-mes-preenchido" style="height:${alturaPercentual}%"></div>
            </div>

            <span>${nomesMeses[indice]}</span>

        </div>

        `;

    }).join("");

}

// ================================
// Inicialização
// ================================

document.addEventListener("DOMContentLoaded", () => {

    popularMesesRelatorio();

    popularAnosRelatorio();

    alternarAbaRelatorio("mensal");

});
