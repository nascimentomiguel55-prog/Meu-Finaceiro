// ================================
// Metas Financeiras
// ================================

let metas = JSON.parse(localStorage.getItem("metas")) || [];

let metaAportes = JSON.parse(localStorage.getItem("metaAportes")) || [];

// ================================
// Utilitário: formatar data yyyy-mm-dd -> dd/mm/yyyy
// ================================

function formatarDataMeta(dataStr) {

    if (!dataStr) return "";

    const partes = dataStr.split("-");

    if (partes.length !== 3) return dataStr;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

// ================================
// Utilitário: texto e peso da prioridade
// ================================

function textoPrioridade(prioridade) {

    if (prioridade === "alta") return "Alta";

    if (prioridade === "media") return "Média";

    return "Baixa";

}

function pesoPrioridade(prioridade) {

    if (prioridade === "alta") return 3;

    if (prioridade === "media") return 2;

    return 1;

}

// ================================
// Salvar Meta
// ================================

function salvarMeta() {

    const nome = document.getElementById("nomeMeta").value.trim();

    const valorObjetivo = parseFloat(document.getElementById("valorObjetivoMeta").value) || 0;

    const dataAlvo = document.getElementById("dataAlvoMeta").value;

    const prioridade = document.getElementById("prioridadeMeta").value;

    if (nome === "") {

        alert("Informe o nome da meta.");

        return;

    }

    if (valorObjetivo <= 0) {

        alert("Informe um valor objetivo válido.");

        return;

    }

    metas.push({

        id: Date.now(),

        nome,

        valorObjetivo,

        dataAlvo: dataAlvo === "" ? null : dataAlvo,

        prioridade

    });

    salvarLocalMetas();

    limparFormularioMeta();

    listarMetas();

    popularMetaSelect();

}

// ================================
// Salvar LocalStorage
// ================================

function salvarLocalMetas() {

    localStorage.setItem("metas", JSON.stringify(metas));

}

function salvarLocalMetaAportes() {

    localStorage.setItem("metaAportes", JSON.stringify(metaAportes));

}

// ================================
// Limpar Formulário de Meta
// ================================

function limparFormularioMeta() {

    document.getElementById("nomeMeta").value = "";

    document.getElementById("valorObjetivoMeta").value = "";

    document.getElementById("dataAlvoMeta").value = "";

    document.getElementById("prioridadeMeta").value = "alta";

}

// ================================
// Excluir Meta
// ================================

function excluirMeta(id) {

    if (!confirm("Excluir esta meta? Todos os aportes registrados para ela também serão removidos.")) return;

    metas = metas.filter(m => m.id !== id);

    metaAportes = metaAportes.filter(a => a.metaId !== id);

    salvarLocalMetas();

    salvarLocalMetaAportes();

    listarMetas();

    popularMetaSelect();

    listarHistoricoAportesMeta();

}

// ================================
// Calcular economizado de uma meta
// ================================

function calcularEconomizadoMeta(metaId) {

    return metaAportes

        .filter(a => a.metaId === metaId)

        .reduce((soma, aporte) => soma + aporte.valor, 0);

}

// ================================
// Estimar previsão de conquista com base na média dos aportes
// ================================

function estimarPrevisaoMeta(metaId, objetivo, economizado) {

    if (economizado >= objetivo) return "atingida";

    const aportesDaMeta = metaAportes.filter(a => a.metaId === metaId);

    if (aportesDaMeta.length < 2) return null;

    const datas = aportesDaMeta.map(a => new Date(a.data + "T00:00:00")).sort((a, b) => a - b);

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
// Listar Metas (ordenadas por prioridade)
// ================================

function listarMetas() {

    const lista = document.getElementById("listaMetas");

    if (!lista) return;

    if (metas.length === 0) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="target"></i>

            <p>Nenhuma meta criada ainda.</p>

        </div>

        `;

        lucide.createIcons();

        return;

    }

    const ordenadas = [...metas].sort((a, b) => pesoPrioridade(b.prioridade) - pesoPrioridade(a.prioridade));

    lista.innerHTML = "";

    ordenadas.forEach(meta => {

        const economizado = calcularEconomizadoMeta(meta.id);

        const percentual = meta.valorObjetivo > 0 ? Math.min(100, Math.round((economizado / meta.valorObjetivo) * 100)) : 0;

        const faltam = Math.max(0, meta.valorObjetivo - economizado);

        const previsao = estimarPrevisaoMeta(meta.id, meta.valorObjetivo, economizado);

        let previsaoTexto = "Adicione mais aportes para estimar a previsão.";

        if (previsao === "atingida") {

            previsaoTexto = "🎉 Meta atingida!";

        } else if (previsao) {

            previsaoTexto = `Previsão: ${previsao.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`;

        }

        lista.innerHTML += `

        <div class="meta-item">

            <div class="meta-topo">

                <div class="meta-topo-info">
                    <h4>${meta.nome}</h4>
                    <span class="badge badge-${meta.prioridade}">${textoPrioridade(meta.prioridade)}</span>
                </div>

                <button class="delete-button" onclick="excluirMeta(${meta.id})">Excluir</button>

            </div>

            <div class="meta-progresso-barra">
                <div class="meta-progresso-preenchido" style="width:${percentual}%"></div>
            </div>

            <div class="meta-info-linha">
                <span>R$ ${economizado.toFixed(2)} de R$ ${meta.valorObjetivo.toFixed(2)}</span>
                <span>${percentual}%</span>
            </div>

            <div class="meta-info-linha">
                <span>Faltam R$ ${faltam.toFixed(2)}</span>
                ${meta.dataAlvo ? `<span>Alvo: ${formatarDataMeta(meta.dataAlvo)}</span>` : ""}
            </div>

            <p class="meta-previsao">${previsaoTexto}</p>

        </div>

        `;

    });

    lucide.createIcons();

}

// ================================
// Popular select de metas
// ================================

function popularMetaSelect() {

    const select = document.getElementById("metaSelect");

    if (!select) return;

    const selecionadoAnterior = select.value;

    select.innerHTML = '<option value="">Selecione uma meta</option>' +

        metas.map(m => `<option value="${m.id}">${m.nome}</option>`).join("");

    if (metas.some(m => String(m.id) === selecionadoAnterior)) {

        select.value = selecionadoAnterior;

    }

}

// ================================
// Registrar Aporte
// ================================

function registrarAporteMeta() {

    const metaId = Number(document.getElementById("metaSelect").value);

    const valor = parseFloat(document.getElementById("valorAporteMeta").value) || 0;

    const descricao = document.getElementById("descricaoAporteMeta").value.trim();

    const data = document.getElementById("dataAporteMeta").value;

    if (!metaId) {

        alert("Selecione uma meta.");

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

    const meta = metas.find(m => m.id === metaId);

    if (!meta) {

        alert("Meta não encontrada.");

        return;

    }

    metaAportes.push({

        id: Date.now(),

        metaId,

        valor,

        descricao: descricao === "" ? "Aporte" : descricao,

        data

    });

    salvarLocalMetaAportes();

    limparFormularioAporteMeta();

    listarMetas();

    listarHistoricoAportesMeta();

}

// ================================
// Limpar Formulário de Aporte
// ================================

function limparFormularioAporteMeta() {

    document.getElementById("valorAporteMeta").value = "";

    document.getElementById("descricaoAporteMeta").value = "";

    document.getElementById("dataAporteMeta").value = new Date().toISOString().split("T")[0];

}

// ================================
// Excluir Aporte
// ================================

function excluirAporteMeta(id) {

    if (!confirm("Excluir este aporte?")) return;

    metaAportes = metaAportes.filter(a => a.id !== id);

    salvarLocalMetaAportes();

    listarMetas();

    listarHistoricoAportesMeta();

}

// ================================
// Listar Histórico de Aportes (todas as metas)
// ================================

function listarHistoricoAportesMeta() {

    const lista = document.getElementById("listaHistoricoAportesMeta");

    if (!lista) return;

    if (metaAportes.length === 0) {

        lista.innerHTML = `

        <div class="empty">

            <i data-lucide="history"></i>

            <p>Nenhum aporte registrado ainda.</p>

        </div>

        `;

        lucide.createIcons();

        return;

    }

    const ordenados = [...metaAportes].sort((a, b) => new Date(b.data) - new Date(a.data));

    lista.innerHTML = "";

    ordenados.forEach(aporte => {

        const meta = metas.find(m => m.id === aporte.metaId);

        lista.innerHTML += `

        <div class="aporte-meta-item">

            <div class="aporte-meta-info">

                <h4>${aporte.descricao}</h4>

                <p>${meta ? meta.nome : "Meta removida"} • ${formatarDataMeta(aporte.data)}</p>

            </div>

            <div class="aporte-meta-valor">

                <strong>+ R$ ${aporte.valor.toFixed(2)}</strong>

                <button class="delete-button" onclick="excluirAporteMeta(${aporte.id})">Excluir</button>

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

    listarMetas();

    popularMetaSelect();

    listarHistoricoAportesMeta();

    const campoData = document.getElementById("dataAporteMeta");

    if (campoData && !campoData.value) {

        campoData.value = new Date().toISOString().split("T")[0];

    }

});
