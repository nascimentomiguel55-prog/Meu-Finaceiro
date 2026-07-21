// ================================
// Projeto Moto
// ================================

let motoMeta = JSON.parse(localStorage.getItem("motoMeta")) || null;

let motoAportes = JSON.parse(localStorage.getItem("motoAportes")) || [];

let cofrinhos = JSON.parse(localStorage.getItem("cofrinhos")) || [];

let cofrinhoMovimentos = JSON.parse(localStorage.getItem("cofrinhoMovimentos")) || [];

// ================================
// Utilitário: formatar data yyyy-mm-dd -> dd/mm/yyyy
// ================================

function formatarDataMoto(dataStr) {

    if (!dataStr) return "";

    const partes = dataStr.split("-");

    if (partes.length !== 3) return dataStr;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

// ================================
// Salvar / Atualizar Meta da Moto
// ================================

function salvarMetaMoto() {

    const valorMoto = parseFloat(document.getElementById("valorMotoMeta").value) || 0;

    const valorEntrada = parseFloat(document.getElementById("valorEntradaMeta").value) || 0;

    if (valorEntrada <= 0) {

        alert("Informe o valor de entrada que você quer economizar.");

        return;

    }

    motoMeta = {

        valorMoto,

        valorEntrada

    };

    salvarLocalMotoMeta();

    renderProgressoMoto();

}

// ================================
// Salvar LocalStorage
// ================================

function salvarLocalMotoMeta() {

    localStorage.setItem("motoMeta", JSON.stringify(motoMeta));

}

function salvarLocalMotoAportes() {

    localStorage.setItem("motoAportes", JSON.stringify(motoAportes));

}

function salvarLocalCofrinhos() {

    localStorage.setItem("cofrinhos", JSON.stringify(cofrinhos));

}

function salvarLocalCofrinhoMovimentos() {

    localStorage.setItem("cofrinhoMovimentos", JSON.stringify(cofrinhoMovimentos));

}

// ================================
// Preencher o formulário da meta com os valores salvos
// ================================

function preencherFormMetaMoto() {

    if (!motoMeta) return;

    const campoMoto = document.getElementById("valorMotoMeta");

    const campoEntrada = document.getElementById("valorEntradaMeta");

    if (campoMoto) campoMoto.value = motoMeta.valorMoto || "";

    if (campoEntrada) campoEntrada.value = motoMeta.valorEntrada || "";

}

// ================================
// Calcular total economizado
// ================================

function calcularEconomizadoMoto() {

    return motoAportes.reduce((soma, aporte) => soma + aporte.valor, 0);

}

// ================================
// Estimar previsão de conquista com base na média dos aportes
// ================================

function estimarPrevisaoMoto(objetivo, economizado) {

    if (economizado >= objetivo) return "atingida";

    if (motoAportes.length < 2) return null;

    const datas = motoAportes.map(a => new Date(a.data + "T00:00:00")).sort((a, b) => a - b);

    const primeira = datas[0];

    const ultima = datas[datas.length - 1];

    const mesesDecorridos = Math.max(1, (ultima.getFullYear() - primeira.getFullYear()) * 12 + (ultima.getMonth() - primeira.getMonth()) + 1);

    const mediaMensal = economizado / mesesDecorridos;

    if (mediaMensal <= 0) return null;

    const faltam = objetivo - economizado;

    const mesesRestantes = Math.ceil(faltam / mediaMensal);

    const dataPrevista = new Date();

    dataPrevista.setMonth(dataPrevista.getMonth() + mesesRestantes);

    return dataPrevista;

}

// ================================
// Renderizar Progresso da Meta
// ================================

function renderProgressoMoto() {

    const div = document.getElementById("progressoMoto");

    if (!div) return;

    if (!motoMeta || !motoMeta.valorEntrada) {

        div.innerHTML = `<div class="empty-mini"><p>Defina a meta acima para acompanhar o progresso.</p></div>`;

        return;

    }

    const economizado = calcularEconomizadoMoto();

    const objetivo = motoMeta.valorEntrada;

    const percentual = objetivo > 0 ? Math.min(100, Math.round((economizado / objetivo) * 100)) : 0;

    const faltam = Math.max(0, objetivo - economizado);

    const previsao = estimarPrevisaoMoto(objetivo, economizado);

    let previsaoTexto = "Adicione mais aportes para estimar a previsão de conquista.";

    if (previsao === "atingida") {

        previsaoTexto = "🎉 Meta atingida!";

    } else if (previsao) {

        previsaoTexto = `Previsão de conquista: ${previsao.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`;

    }

    div.innerHTML = `

        <div class="progresso-topo">
            <strong>R$ ${economizado.toFixed(2)}</strong>
            <span>de R$ ${objetivo.toFixed(2)}</span>
        </div>

        <div class="progresso-barra">
            <div class="progresso-barra-preenchido" style="width:${percentual}%"></div>
        </div>

        <div class="progresso-info">
            <span>${percentual}% concluído</span>
            <span>Faltam R$ ${faltam.toFixed(2)}</span>
        </div>

        <p class="previsao-texto">${previsaoTexto}</p>

        ${motoMeta.valorMoto ? `<p class="previsao-texto">Valor da moto: R$ ${motoMeta.valorMoto.toFixed(2)}</p>` : ""}

    `;

}

// ================================
// Registrar Aporte
// ================================

function registrarAporteMoto() {

    const valor = parseFloat(document.getElementById("valorAporteMoto").value) || 0;

    const descricao = document.getElementById("descricaoAporteMoto").value.trim();

    const data = document.getElementById("dataAporteMoto").value;

    if (valor <= 0) {

        alert("Informe um valor válido.");

        return;

    }

    if (data === "") {

        alert("Informe a data.");

        return;

    }

    motoAportes.push({

        id: Date.now(),

        valor,

        descricao: descricao === "" ? "Aporte" : descricao,

        data

    });

    salvarLocalMotoAportes();

    limparFormularioAporteMoto();

    listarAportesMoto();

    renderProgressoMoto();

}

// ================================
// Limpar Formulário de Aporte
// ================================

function limparFormularioAporteMoto() {

    document.getElementById("valorAporteMoto").value = "";

    document.getElementById("descricaoAporteMoto").value = "";

    document.getElementById("dataAporteMoto").value = new Date().toISOString().split("T")[0];

}

// ================================
// Excluir Aporte
// ================================

function excluirAporteMoto(id) {

    if (!confirm("Excluir este aporte?")) return;

    motoAportes = motoAportes.filter(a => a.id !== id);

    salvarLocalMotoAportes();

    listarAportesMoto();

    renderProgressoMoto();

}

// ================================
// Listar Aportes
// ================================

function listarAportesMoto() {

    const lista = document.getElementById("listaAportesMoto");

    if (!lista) return;

    if (motoAportes.length === 0) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="piggy-bank"></i>

            <p>Nenhum aporte registrado ainda.</p>

        </div>

        `;

        lucide.createIcons();

        return;

    }

    const ordenados = [...motoAportes].sort((a, b) => new Date(b.data) - new Date(a.data));

    lista.innerHTML = "";

    ordenados.forEach(aporte => {

        lista.innerHTML += `

        <div class="aporte-item">

            <div class="aporte-info">

                <h4>${aporte.descricao}</h4>

                <p>${formatarDataMoto(aporte.data)}</p>

            </div>

            <div class="aporte-valor">

                <strong>+ R$ ${aporte.valor.toFixed(2)}</strong>

                <button class="delete-button" onclick="excluirAporteMoto(${aporte.id})">Excluir</button>

            </div>

        </div>

        `;

    });

    lucide.createIcons();

}

// ================================
// Salvar Cofrinho
// ================================

function salvarCofrinho() {

    const nome = document.getElementById("nomeCofrinho").value.trim();

    const objetivoValor = document.getElementById("objetivoCofrinho").value;

    const objetivo = objetivoValor === "" ? null : (parseFloat(objetivoValor) || null);

    if (nome === "") {

        alert("Informe o nome do cofrinho.");

        return;

    }

    cofrinhos.push({

        id: Date.now(),

        nome,

        objetivo,

        saldo: 0

    });

    salvarLocalCofrinhos();

    document.getElementById("nomeCofrinho").value = "";

    document.getElementById("objetivoCofrinho").value = "";

    listarCofrinhos();

    popularCofrinhoSelect();

}

// ================================
// Excluir Cofrinho
// ================================

function excluirCofrinho(id) {

    if (!confirm("Excluir este cofrinho? O histórico já gerado será mantido.")) return;

    cofrinhos = cofrinhos.filter(c => c.id !== id);

    salvarLocalCofrinhos();

    listarCofrinhos();

    popularCofrinhoSelect();

}

// ================================
// Popular select de cofrinhos
// ================================

function popularCofrinhoSelect() {

    const select = document.getElementById("cofrinhoSelect");

    if (!select) return;

    const selecionadoAnterior = select.value;

    select.innerHTML = '<option value="">Selecione um cofrinho</option>' +

        cofrinhos.map(c => `<option value="${c.id}">${c.nome}</option>`).join("");

    if (cofrinhos.some(c => String(c.id) === selecionadoAnterior)) {

        select.value = selecionadoAnterior;

    }

}

// ================================
// Listar Cofrinhos
// ================================

function listarCofrinhos() {

    const lista = document.getElementById("listaCofrinhos");

    if (!lista) return;

    if (cofrinhos.length === 0) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="piggy-bank"></i>

            <p>Nenhum cofrinho criado ainda.</p>

        </div>

        `;

        lucide.createIcons();

        return;

    }

    lista.innerHTML = "";

    cofrinhos.forEach(cofrinho => {

        let barraHtml = "";

        if (cofrinho.objetivo && cofrinho.objetivo > 0) {

            const percentual = Math.min(100, Math.round((cofrinho.saldo / cofrinho.objetivo) * 100));

            barraHtml = `

            <div class="cofrinho-objetivo-barra">
                <div class="cofrinho-objetivo-preenchido" style="width:${percentual}%"></div>
            </div>

            <div class="cofrinho-objetivo-info">${percentual}% de R$ ${cofrinho.objetivo.toFixed(2)}</div>

            `;

        }

        lista.innerHTML += `

        <div class="cofrinho-item">

            <div class="cofrinho-topo">

                <div>
                    <h4>${cofrinho.nome}</h4>
                    <button class="delete-button" onclick="excluirCofrinho(${cofrinho.id})">Excluir</button>
                </div>

                <div class="cofrinho-saldo">
                    <strong>R$ ${cofrinho.saldo.toFixed(2)}</strong>
                </div>

            </div>

            ${barraHtml}

        </div>

        `;

    });

    lucide.createIcons();

}

// ================================
// Registrar Movimento no Cofrinho
// ================================

function registrarMovimentoCofrinho() {

    const cofrinhoId = Number(document.getElementById("cofrinhoSelect").value);

    const tipo = document.getElementById("tipoMovimentoCofrinho").value;

    const valor = parseFloat(document.getElementById("valorMovimentoCofrinho").value) || 0;

    const descricao = document.getElementById("descricaoMovimentoCofrinho").value.trim();

    const data = document.getElementById("dataMovimentoCofrinho").value;

    if (!cofrinhoId) {

        alert("Selecione um cofrinho.");

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

    const cofrinho = cofrinhos.find(c => c.id === cofrinhoId);

    if (!cofrinho) {

        alert("Cofrinho não encontrado.");

        return;

    }

    if (tipo === "retirada" && valor > cofrinho.saldo) {

        alert(`Saldo insuficiente no cofrinho. Saldo disponível: R$ ${cofrinho.saldo.toFixed(2)}`);

        return;

    }

    if (tipo === "deposito") {

        cofrinho.saldo += valor;

    } else {

        cofrinho.saldo -= valor;

    }

    salvarLocalCofrinhos();

    cofrinhoMovimentos.push({

        id: Date.now(),

        cofrinhoId,

        tipo,

        valor,

        descricao: descricao === "" ? (tipo === "deposito" ? "Depósito" : "Retirada") : descricao,

        data

    });

    salvarLocalCofrinhoMovimentos();

    document.getElementById("valorMovimentoCofrinho").value = "";

    document.getElementById("descricaoMovimentoCofrinho").value = "";

    document.getElementById("dataMovimentoCofrinho").value = new Date().toISOString().split("T")[0];

    listarCofrinhos();

    listarHistoricoCofrinhos();

}

// ================================
// Listar Histórico dos Cofrinhos
// ================================

function listarHistoricoCofrinhos() {

    const lista = document.getElementById("listaHistoricoCofrinhos");

    if (!lista) return;

    if (cofrinhoMovimentos.length === 0) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="history"></i>

            <p>Nenhuma movimentação ainda.</p>

        </div>

        `;

        lucide.createIcons();

        return;

    }

    const ordenados = [...cofrinhoMovimentos].sort((a, b) => new Date(b.data) - new Date(a.data));

    lista.innerHTML = "";

    ordenados.slice(0, 15).forEach(mov => {

        const cofrinho = cofrinhos.find(c => c.id === mov.cofrinhoId);

        lista.innerHTML += `

        <div class="historico-cofrinho-item">

            <div class="historico-cofrinho-info">

                <h4>${mov.descricao}</h4>

                <p>${cofrinho ? cofrinho.nome : "Cofrinho removido"} • ${formatarDataMoto(mov.data)}</p>

            </div>

            <div class="historico-cofrinho-valor">

                <strong>${mov.tipo === "deposito" ? "+" : "-"} R$ ${mov.valor.toFixed(2)}</strong>

                <span class="badge ${mov.tipo === "deposito" ? "badge-deposito" : "badge-retirada"}">
                    ${mov.tipo === "deposito" ? "Depósito" : "Retirada"}
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

    preencherFormMetaMoto();

    renderProgressoMoto();

    listarAportesMoto();

    popularCofrinhoSelect();

    listarCofrinhos();

    listarHistoricoCofrinhos();

    const campoDataAporte = document.getElementById("dataAporteMoto");

    if (campoDataAporte && !campoDataAporte.value) {

        campoDataAporte.value = new Date().toISOString().split("T")[0];

    }

    const campoDataMovimento = document.getElementById("dataMovimentoCofrinho");

    if (campoDataMovimento && !campoDataMovimento.value) {

        campoDataMovimento.value = new Date().toISOString().split("T")[0];

    }

});
