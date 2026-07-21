// ================================
// Vale Alimentação (VR)
// ================================

let vrCartoes = JSON.parse(localStorage.getItem("vrCartoes")) || [];

let vrRecargas = JSON.parse(localStorage.getItem("vrRecargas")) || [];

let vrCompras = JSON.parse(localStorage.getItem("vrCompras")) || [];

// ================================
// Utilitário: mês atual "yyyy-mm"
// ================================

function mesAtualVrStr() {

    const hoje = new Date();

    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

}

// ================================
// Utilitário: formatar "yyyy-mm" para "Mês/Ano"
// ================================

function formatarMesVr(mesReferencia) {

    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const [ano, mes] = mesReferencia.split("-").map(Number);

    return `${meses[mes - 1]}/${ano}`;

}

// ================================
// Utilitário: formatar data yyyy-mm-dd -> dd/mm/yyyy
// ================================

function formatarDataVr(dataStr) {

    if (!dataStr) return "";

    const partes = dataStr.split("-");

    if (partes.length !== 3) return dataStr;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

// ================================
// Salvar Vale Alimentação
// ================================

function salvarVr() {

    const nome = document.getElementById("nomeVr").value.trim();

    const saldoInicial = parseFloat(document.getElementById("saldoInicialVr").value) || 0;

    const diaRecarga = parseInt(document.getElementById("diaRecargaVr").value);

    const valorRecarga = parseFloat(document.getElementById("valorRecargaVr").value) || 0;

    if (nome === "") {

        alert("Informe o nome do vale.");

        return;

    }

    if (!diaRecarga || diaRecarga < 1 || diaRecarga > 31) {

        alert("Informe um dia de recarga válido (1 a 31).");

        return;

    }

    if (valorRecarga <= 0) {

        alert("Informe um valor de recarga válido.");

        return;

    }

    vrCartoes.push({

        id: Date.now(),

        nome,

        saldo: saldoInicial,

        diaRecarga,

        valorRecarga

    });

    salvarLocalVrCartoes();

    limparFormularioVr();

    listarVr();

    gerarRecargaMesAtual();

    popularVrCompraSelect();

}

// ================================
// Salvar LocalStorage
// ================================

function salvarLocalVrCartoes() {

    localStorage.setItem("vrCartoes", JSON.stringify(vrCartoes));

}

function salvarLocalVrRecargas() {

    localStorage.setItem("vrRecargas", JSON.stringify(vrRecargas));

}

function salvarLocalVrCompras() {

    localStorage.setItem("vrCompras", JSON.stringify(vrCompras));

}

// ================================
// Limpar Formulário
// ================================

function limparFormularioVr() {

    document.getElementById("nomeVr").value = "";

    document.getElementById("saldoInicialVr").value = "";

    document.getElementById("diaRecargaVr").value = "";

    document.getElementById("valorRecargaVr").value = "";

}

// ================================
// Listar Vales Cadastrados
// ================================

function listarVr() {

    const lista = document.getElementById("listaVr");

    if (!lista) return;

    if (vrCartoes.length === 0) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="utensils"></i>

            <p>Nenhum vale cadastrado.</p>

        </div>

        `;

        lucide.createIcons();

        return;

    }

    lista.innerHTML = "";

    vrCartoes.forEach(vr => {

        lista.innerHTML += `

        <div class="vr-item">

            <div class="vr-info">

                <h4>${vr.nome}</h4>

                <p>Recarga dia ${vr.diaRecarga} • R$ ${vr.valorRecarga.toFixed(2)}/mês</p>

                <button class="delete-button" onclick="excluirVr(${vr.id})">Excluir</button>

            </div>

            <div class="vr-saldo">R$ ${vr.saldo.toFixed(2)}</div>

        </div>

        `;

    });

    lucide.createIcons();

}

// ================================
// Excluir Vale
// ================================

function excluirVr(id) {

    if (!confirm("Excluir este vale? O histórico já gerado será mantido.")) return;

    vrCartoes = vrCartoes.filter(v => v.id !== id);

    salvarLocalVrCartoes();

    listarVr();

    popularVrCompraSelect();

    if (typeof popularVrMercado === "function") popularVrMercado();

}

// ================================
// Gerar automaticamente a recarga do mês atual
// ================================

function gerarRecargaMesAtual() {

    const mesAtual = mesAtualVrStr();

    vrCartoes.forEach(vr => {

        const jaRecarregou = vrRecargas.some(r => r.vrId === vr.id && r.mesReferencia === mesAtual);

        if (!jaRecarregou) {

            vr.saldo += vr.valorRecarga;

            vrRecargas.push({

                id: Date.now() + Math.floor(Math.random() * 1000),

                vrId: vr.id,

                mesReferencia: mesAtual,

                valor: vr.valorRecarga,

                data: new Date().toISOString().split("T")[0]

            });

        }

    });

    salvarLocalVrCartoes();

    salvarLocalVrRecargas();

}

// ================================
// Popular select de vales (compra manual - vr.js)
// ================================

function popularVrCompraSelect() {

    const select = document.getElementById("vrCompraSelect");

    if (!select) return;

    const selecionadoAnterior = select.value;

    select.innerHTML = '<option value="">Selecione um vale</option>' +

        vrCartoes.map(v => `<option value="${v.id}">${v.nome}</option>`).join("");

    if (vrCartoes.some(v => String(v.id) === selecionadoAnterior)) {

        select.value = selecionadoAnterior;

    }

}

// ================================
// Registrar Compra Manual
// ================================

function registrarCompraVr() {

    const vrId = Number(document.getElementById("vrCompraSelect").value);

    const descricao = document.getElementById("descricaoCompraVr").value.trim();

    const valor = parseFloat(document.getElementById("valorCompraVr").value) || 0;

    const data = document.getElementById("dataCompraVr").value;

    if (!vrId) {

        alert("Selecione um vale.");

        return;

    }

    if (descricao === "") {

        alert("Informe uma descrição.");

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

    const vr = vrCartoes.find(v => v.id === vrId);

    if (!vr) {

        alert("Vale não encontrado.");

        return;

    }

    if (valor > vr.saldo) {

        alert(`Saldo insuficiente. Saldo disponível: R$ ${vr.saldo.toFixed(2)}`);

        return;

    }

    vr.saldo -= valor;

    salvarLocalVrCartoes();

    vrCompras.push({

        id: Date.now(),

        vrId: vr.id,

        descricao,

        valor,

        data

    });

    salvarLocalVrCompras();

    limparFormularioCompraVr();

    listarVr();

    listarHistoricoVr();

}

// ================================
// Limpar Formulário de Compra
// ================================

function limparFormularioCompraVr() {

    document.getElementById("descricaoCompraVr").value = "";

    document.getElementById("valorCompraVr").value = "";

    document.getElementById("dataCompraVr").value = new Date().toISOString().split("T")[0];

}

// ================================
// Listar Histórico (recargas + compras)
// ================================

function listarHistoricoVr() {

    const lista = document.getElementById("listaHistoricoVr");

    if (!lista) return;

    const itens = [];

    vrRecargas.forEach(r => {

        const vr = vrCartoes.find(v => v.id === r.vrId);

        itens.push({

            tipo: "recarga",

            nome: vr ? vr.nome : "Vale removido",

            descricao: `Recarga automática (${formatarMesVr(r.mesReferencia)})`,

            valor: r.valor,

            data: r.data

        });

    });

    vrCompras.forEach(c => {

        const vr = vrCartoes.find(v => v.id === c.vrId);

        itens.push({

            tipo: "compra",

            nome: vr ? vr.nome : "Vale removido",

            descricao: c.descricao,

            valor: c.valor,

            data: c.data

        });

    });

    if (itens.length === 0) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="history"></i>

            <p>Nenhuma movimentação ainda.</p>

        </div>

        `;

        lucide.createIcons();

        return;

    }

    const ordenados = itens.sort((a, b) => new Date(b.data) - new Date(a.data));

    lista.innerHTML = "";

    ordenados.slice(0, 20).forEach(item => {

        lista.innerHTML += `

        <div class="historico-vr-item">

            <div class="historico-vr-info">

                <h4>${item.descricao}</h4>

                <p>${item.nome} • ${formatarDataVr(item.data)}</p>

            </div>

            <div class="historico-vr-valor">

                <strong>${item.tipo === "recarga" ? "+" : "-"} R$ ${item.valor.toFixed(2)}</strong>

                <span class="badge ${item.tipo === "recarga" ? "badge-recarga" : "badge-compra"}">
                    ${item.tipo === "recarga" ? "Recarga" : "Compra"}
                </span>

            </div>

        </div>

        `;

    });

    lucide.createIcons();

}

// ================================
// Inicialização
// ================================

document.addEventListener("DOMContentLoaded", () => {

    gerarRecargaMesAtual();

    listarVr();

    popularVrCompraSelect();

    listarHistoricoVr();

    const campoData = document.getElementById("dataCompraVr");

    if (campoData && !campoData.value) {

        campoData.value = new Date().toISOString().split("T")[0];

    }

});
