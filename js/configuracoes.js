// ================================
// Configurações
// ================================

// Lista de todas as chaves do LocalStorage usadas pelo app
const CHAVES_BACKUP = [

    "contas",
    "movimentos",
    "cartoes",
    "comprasCartao",
    "contasCasaFixas",
    "lancamentosCasa",
    "listaMercadoAtual",
    "comprasMercado",
    "vrCartoes",
    "vrRecargas",
    "vrCompras",
    "motoMeta",
    "motoAportes",
    "cofrinhos",
    "cofrinhoMovimentos",
    "metas",
    "metaAportes",
    "miaHistorico",
    "vozAtivadaMia"

];

// ================================
// Exportar Dados (gera e baixa um .json)
// ================================

function exportarDados() {

    const backup = {

        app: "Meu Financeiro",

        versao: "1.0.0",

        dataExportacao: new Date().toISOString(),

        dados: {}

    };

    CHAVES_BACKUP.forEach(chave => {

        const valorBruto = localStorage.getItem(chave);

        if (valorBruto !== null) {

            try {

                backup.dados[chave] = JSON.parse(valorBruto);

            } catch (erro) {

                console.log("Não foi possível ler a chave", chave, erro);

            }

        }

    });

    const conteudo = JSON.stringify(backup, null, 2);

    const blob = new Blob([conteudo], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const dataFormatada = new Date().toISOString().split("T")[0];

    const link = document.createElement("a");

    link.href = url;

    link.download = `meu-financeiro-backup-${dataFormatada}.json`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    alert("Backup exportado! Verifique a pasta de downloads do seu celular (ou onde o navegador salva arquivos baixados).");

}

// ================================
// Importar Dados
// ================================

function acionarImportacao() {

    const input = document.getElementById("inputImportarBackup");

    if (input) input.click();

}

function processarImportacao(evento) {

    const arquivo = evento.target.files[0];

    if (!arquivo) return;

    if (!confirm("Importar este backup vai SUBSTITUIR todos os dados atuais do app por completo. Deseja continuar?")) {

        evento.target.value = "";

        return;

    }

    const leitor = new FileReader();

    leitor.onload = function (eventoLeitura) {

        try {

            const conteudo = JSON.parse(eventoLeitura.target.result);

            // Aceita tanto o formato gerado pela Exportação ({dados: {...}})
            // quanto um JSON simples só com as chaves diretamente
            const dados = conteudo.dados ? conteudo.dados : conteudo;

            const chavesEncontradas = Object.keys(dados);

            if (chavesEncontradas.length === 0) {

                alert("Esse arquivo não parece ter dados válidos para importar.");

                return;

            }

            chavesEncontradas.forEach(chave => {

                localStorage.setItem(chave, JSON.stringify(dados[chave]));

            });

            alert("Backup importado com sucesso! O app vai recarregar agora.");

            location.reload();

        } catch (erro) {

            alert("Não consegui ler esse arquivo. Confira se é um backup válido do Meu Financeiro (.json).");

        }

    };

    leitor.readAsText(arquivo);

    evento.target.value = "";

}

// ================================
// Limpar os dados de um módulo específico
// (zera a variável em memória E o localStorage)
// ================================

function limparModulo(chave) {

    switch (chave) {

        case "bancos":

            if (typeof contas !== "undefined") contas = [];

            localStorage.removeItem("contas");

            break;

        case "financeiro":

            if (typeof movimentos !== "undefined") movimentos = [];

            localStorage.removeItem("movimentos");

            break;

        case "cartoes":

            if (typeof cartoes !== "undefined") cartoes = [];

            if (typeof compras !== "undefined") compras = [];

            localStorage.removeItem("cartoes");

            localStorage.removeItem("comprasCartao");

            break;

        case "casa":

            if (typeof contasCasaFixas !== "undefined") contasCasaFixas = [];

            if (typeof lancamentosCasa !== "undefined") lancamentosCasa = [];

            localStorage.removeItem("contasCasaFixas");

            localStorage.removeItem("lancamentosCasa");

            break;

        case "mercado":

            if (typeof listaMercadoAtual !== "undefined") listaMercadoAtual = [];

            if (typeof comprasMercado !== "undefined") comprasMercado = [];

            localStorage.removeItem("listaMercadoAtual");

            localStorage.removeItem("comprasMercado");

            break;

        case "vr":

            if (typeof vrCartoes !== "undefined") vrCartoes = [];

            if (typeof vrRecargas !== "undefined") vrRecargas = [];

            if (typeof vrCompras !== "undefined") vrCompras = [];

            localStorage.removeItem("vrCartoes");

            localStorage.removeItem("vrRecargas");

            localStorage.removeItem("vrCompras");

            break;

        case "moto":

            if (typeof motoMeta !== "undefined") motoMeta = null;

            if (typeof motoAportes !== "undefined") motoAportes = [];

            if (typeof cofrinhos !== "undefined") cofrinhos = [];

            if (typeof cofrinhoMovimentos !== "undefined") cofrinhoMovimentos = [];

            localStorage.removeItem("motoMeta");

            localStorage.removeItem("motoAportes");

            localStorage.removeItem("cofrinhos");

            localStorage.removeItem("cofrinhoMovimentos");

            break;

        case "metas":

            if (typeof metas !== "undefined") metas = [];

            if (typeof metaAportes !== "undefined") metaAportes = [];

            localStorage.removeItem("metas");

            localStorage.removeItem("metaAportes");

            break;

        case "mia":

            if (typeof miaHistorico !== "undefined") miaHistorico = [];

            localStorage.removeItem("miaHistorico");

            break;

        default:

            console.log("Módulo desconhecido para limpeza:", chave);

    }

}

// ================================
// Limpar um módulo, com confirmação
// ================================

function limparModuloConfirmado(chave, label) {

    if (!confirm(`Tem certeza que deseja apagar todos os dados de "${label}"? Essa ação não pode ser desfeita.`)) {

        return;

    }

    limparModulo(chave);

    alert(`Dados de "${label}" apagados com sucesso.`);

}

// ================================
// Limpar tudo, com confirmação
// ================================

function limparTudoConfirmado() {

    if (!confirm("Tem certeza que deseja apagar TODOS os dados do aplicativo? Essa ação não pode ser desfeita.")) {

        return;

    }

    const modulos = ["bancos", "financeiro", "cartoes", "casa", "mercado", "vr", "moto", "metas", "mia"];

    modulos.forEach(chave => limparModulo(chave));

    alert("Todos os dados do aplicativo foram apagados.");

}
