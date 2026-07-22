// ================================
// Mia - Assistente Financeira
// ================================

let miaHistorico = JSON.parse(localStorage.getItem("miaHistorico")) || [];

// Pergunta pendente (ex.: "de qual conta devo debitar?"). Fica só em memória,
// então some se você recarregar o app por completo.
let miaPendente = null;

// Reconhecimento de voz (fala -> texto)
let reconhecimentoVozMia = null;

let ouvindoVoz = false;

// Modo contínuo: depois de tocar o microfone uma vez, ela continua
// ouvindo e respondendo em loop, sem precisar tocar de novo
let modoContinuoAtivo = false;

// Marca se a sessão atual de escuta capturou alguma fala (usado para saber
// se devemos reiniciar automaticamente após um silêncio, no modo contínuo)
let resultadoRecebidoNestaSessao = false;

// Se a Mia deve falar as respostas em voz alta (fica salvo)
let vozAtivadaMia = JSON.parse(localStorage.getItem("vozAtivadaMia")) ?? true;

// ================================
// Salvar LocalStorage
// ================================

function salvarLocalMiaHistorico() {

    localStorage.setItem("miaHistorico", JSON.stringify(miaHistorico));

}

// ================================
// Adicionar Mensagem ao Histórico
// ================================

function adicionarMensagemMia(texto, souUsuario) {

    miaHistorico.push({

        autor: souUsuario ? "user" : "mia",

        texto

    });

    salvarLocalMiaHistorico();

}

// ================================
// Renderizar o Chat
// ================================

function renderizarChatMia() {

    const div = document.getElementById("chatMensagens");

    if (!div) return;

    if (miaHistorico.length === 0) {

        adicionarMensagemMia(

            "Oi, Wellington! Eu sou a Mia 🤖\n\nPosso te contar seu saldo, seus próximos vencimentos ou sua lista de mercado. Também posso registrar gastos e receitas — é só me escrever algo como \"gastei 50 no mercado\" ou \"recebi 200 de salário\".\n\nToque no microfone e eu fico ouvindo em loop, respondendo cada frase, até você tocar de novo para parar (ou dizer \"parar\").",

            false

        );

    }

    div.innerHTML = miaHistorico.map(msg => `

        <div class="chat-bubble ${msg.autor === "user" ? "chat-bubble-user" : "chat-bubble-mia"}">
            <p>${msg.texto.replace(/\n/g, "<br>")}</p>
        </div>

    `).join("");

    div.scrollTop = div.scrollHeight;

}

// ================================
// Enviar Mensagem
// ================================

function enviarMensagemMia() {

    const input = document.getElementById("chatInput");

    const texto = input.value.trim();

    if (texto === "") return;

    adicionarMensagemMia(texto, true);

    input.value = "";

    const resposta = processarMensagemMia(texto);

    adicionarMensagemMia(resposta, false);

    renderizarChatMia();

    // Fala a resposta e, quando ela terminar de falar, se o modo contínuo
    // estiver ativo, volta a ouvir automaticamente
    falarTextoMia(resposta, () => {

        if (modoContinuoAtivo) {

            reiniciarEscutaContinua();

        }

    });

}

// ================================
// Enviar Sugestão Rápida
// ================================

function enviarSugestaoMia(texto) {

    const input = document.getElementById("chatInput");

    if (input) input.value = texto;

    enviarMensagemMia();

}

// ================================
// Processar Mensagem (motor de regras)
// ================================

function processarMensagemMia(textoOriginal) {

    const texto = textoOriginal.toLowerCase().trim();

    // Comando para parar o modo contínuo, falado ou escrito

    if (/^(parar|pare|para|cancelar escuta|pode parar)$/.test(texto)) {

        if (modoContinuoAtivo) {

            pararModoContinuo();

            return "Ok, parei de ouvir. Toque no microfone quando quiser conversar de novo.";

        }

        return "Já não estou ouvindo em modo contínuo, mas estou aqui se precisar!";

    }

    // Se há uma pergunta pendente (ex.: "de qual conta?"), tenta resolver primeiro
    if (miaPendente) {

        const respostaPendente = tentarResolverPendenciaMia(texto);

        if (respostaPendente !== null) {

            return respostaPendente;

        }

        // Se respostaPendente for null, significa que o usuário mudou de assunto
        // (ex. perguntou "saldo" no meio do fluxo) — segue o processamento normal abaixo.

    }

    // Saudação

    if (/^(oi|ol[áa]|bom dia|boa tarde|boa noite|e a[íi])/.test(texto)) {

        return "Oi! Como posso ajudar? Você pode me perguntar sobre saldo, vencimentos, lista de mercado, ou me contar um gasto.";

    }

    // Ajuda

    if (texto.includes("ajuda") || texto.includes("o que voc") || texto.includes("comandos")) {

        return "Aqui está o que eu sei fazer:\n\n• \"saldo\" → seu saldo total\n• \"vencimentos\" → contas e faturas pendentes\n• \"lista de mercado\" → o que falta comprar\n• \"gastei 50 no mercado\" → registro a saída\n• \"recebi 200 de salário\" → registro a entrada\n• \"parar\" → encerra o modo de escuta contínua";

    }

    // Registrar gasto

    const matchGasto = texto.match(/gastei\s+(?:r\$)?\s*([\d.,]+)\s*(?:em|no|na|com)?\s*(.*)/);

    if (matchGasto) {

        const valor = parseFloat(matchGasto[1].replace(",", "."));

        const descricao = matchGasto[2] ? matchGasto[2].trim() : "";

        if (isNaN(valor) || valor <= 0) {

            return "Não entendi o valor do gasto. Tente algo como \"gastei 50 no mercado\".";

        }

        return iniciarRegistroMia("saida", valor, descricao);

    }

    // Registrar receita

    const matchReceita = texto.match(/receb[ií]\s+(?:r\$)?\s*([\d.,]+)\s*(?:de|do|da)?\s*(.*)/);

    if (matchReceita) {

        const valor = parseFloat(matchReceita[1].replace(",", "."));

        const descricao = matchReceita[2] ? matchReceita[2].trim() : "";

        if (isNaN(valor) || valor <= 0) {

            return "Não entendi o valor. Tente algo como \"recebi 200 de salário\".";

        }

        return iniciarRegistroMia("entrada", valor, descricao);

    }

    // Saldo

    if (texto.includes("saldo") || texto.includes("quanto eu tenho") || texto.includes("quanto tenho")) {

        return responderSaldoMia();

    }

    // Vencimentos

    if (texto.includes("vencimento") || texto.includes("pagar") || texto.includes("o que vence")) {

        return responderVencimentosMia();

    }

    // Lista de mercado

    if (texto.includes("mercado") || texto.includes("compra")) {

        return responderListaMercadoMia();

    }

    return "Não entendi 🤔 Tente perguntar sobre \"saldo\", \"vencimentos\", \"lista de mercado\", ou me conte um gasto tipo \"gastei 30 no combustível\". Digite \"ajuda\" para ver tudo que eu sei fazer.";

}

// ================================
// Iniciar registro de gasto/receita
// (decide se pergunta a conta ou já lança direto)
// ================================

function iniciarRegistroMia(tipo, valor, descricao) {

    const listaContas = (typeof contas !== "undefined") ? contas : [];

    if (listaContas.length === 0) {

        return "Você ainda não tem nenhuma conta cadastrada. Cadastre uma em Bancos antes de registrar isso comigo.";

    }

    if (listaContas.length === 1) {

        return finalizarRegistroMia(listaContas[0], tipo, valor, descricao);

    }

    // Mais de uma conta: pergunta qual usar
    miaPendente = { tipo, valor, descricao };

    const listaTexto = listaContas.map((c, i) => `${i + 1}. ${c.nome} (R$ ${c.saldo.toFixed(2)})`).join("\n");

    const acao = tipo === "saida" ? "debitar" : "creditar";

    return `Você tem mais de uma conta. De qual conta devo ${acao} R$ ${valor.toFixed(2)}${descricao ? " (" + descricao + ")" : ""}?\n\n${listaTexto}\n\nResponda com o nome ou o número da conta.`;

}

// ================================
// Tentar resolver a pergunta pendente sobre qual conta usar
// Retorna a resposta se resolveu, ou null se o usuário mudou de assunto
// ================================

function tentarResolverPendenciaMia(texto) {

    if (texto === "cancelar") {

        miaPendente = null;

        return "Ok, cancelei esse registro.";

    }

    const listaContas = (typeof contas !== "undefined") ? contas : [];

    // Tenta achar pelo nome da conta

    const contaPorNome = listaContas.find(c => texto.includes(c.nome.toLowerCase()));

    if (contaPorNome) {

        const resultado = finalizarRegistroMia(contaPorNome, miaPendente.tipo, miaPendente.valor, miaPendente.descricao);

        miaPendente = null;

        return resultado;

    }

    // Tenta achar pelo número da lista mostrada

    const numero = parseInt(texto);

    if (!isNaN(numero) && listaContas[numero - 1]) {

        const resultado = finalizarRegistroMia(listaContas[numero - 1], miaPendente.tipo, miaPendente.valor, miaPendente.descricao);

        miaPendente = null;

        return resultado;

    }

    // Se o usuário parece estar perguntando outra coisa, cancela a pendência
    // e deixa o fluxo normal responder (ex. ele perguntou "saldo" no meio do caminho)

    const pareceOutroAssunto = texto.includes("saldo") || texto.includes("vencimento") ||

        texto.includes("mercado") || texto.includes("ajuda");

    if (pareceOutroAssunto) {

        miaPendente = null;

        return null;

    }

    return "Não reconheci essa conta. Responda com o nome dela ou o número da lista (ou digite \"cancelar\").";

}

// ================================
// Finalizar o registro (debitar/creditar de fato)
// ================================

function finalizarRegistroMia(conta, tipo, valor, descricaoBruta) {

    const categoria = descricaoBruta ? capitalizarMia(descricaoBruta) : "Outros";

    if (tipo === "saida") {

        conta.saldo -= valor;

    } else {

        conta.saldo += valor;

    }

    if (typeof salvarLocal === "function") salvarLocal();

    if (typeof movimentos !== "undefined") {

        movimentos.push({

            id: Date.now(),

            contaId: conta.id,

            contaNome: conta.nome,

            tipo,

            categoria,

            valor,

            descricao: descricaoBruta || (tipo === "saida" ? "Gasto via Mia" : "Receita via Mia"),

            data: new Date().toISOString().split("T")[0]

        });

        if (typeof salvarLocalMovimentos === "function") salvarLocalMovimentos();

    }

    if (typeof listarContas === "function") listarContas();

    if (typeof atualizarDashboard === "function") atualizarDashboard();

    const acaoTexto = tipo === "saida" ? "uma saída" : "uma entrada";

    return `Prontinho! Registrei ${acaoTexto} de R$ ${valor.toFixed(2)} (${categoria}) na conta ${conta.nome}. Novo saldo: R$ ${conta.saldo.toFixed(2)}.`;

}

// ================================
// Utilitário: capitalizar primeira letra
// ================================

function capitalizarMia(texto) {

    if (!texto) return texto;

    return texto.charAt(0).toUpperCase() + texto.slice(1);

}

// ================================
// Responder: Saldo
// ================================

function responderSaldoMia() {

    if (typeof saldoTotal !== "function") {

        return "Ainda não encontrei suas contas cadastradas.";

    }

    const total = saldoTotal();

    let detalhe = "";

    if (typeof contas !== "undefined" && contas.length > 0) {

        detalhe = contas.map(c => `• ${c.nome}: R$ ${c.saldo.toFixed(2)}`).join("\n");

    }

    return `Seu saldo total é R$ ${total.toFixed(2)}.${detalhe ? "\n\n" + detalhe : ""}`;

}

// ================================
// Responder: Vencimentos
// ================================

function responderVencimentosMia() {

    const itens = [];

    if (typeof lancamentosCasa !== "undefined") {

        lancamentosCasa.filter(l => !l.paga).forEach(l => {

            itens.push({ nome: l.nome, valor: l.valor, vencimento: l.vencimento });

        });

    }

    if (typeof compras !== "undefined" && typeof cartoes !== "undefined") {

        const agrupado = {};

        compras.forEach(compra => {

            compra.parcelas.forEach(parcela => {

                if (!parcela.paga) {

                    const chave = `${compra.cartaoId}_${parcela.mesReferencia}`;

                    if (!agrupado[chave]) {

                        agrupado[chave] = { cartaoId: compra.cartaoId, mesReferencia: parcela.mesReferencia, valor: 0 };

                    }

                    agrupado[chave].valor += parcela.valor;

                }

            });

        });

        Object.values(agrupado).forEach(grupo => {

            const cartao = cartoes.find(c => c.id === grupo.cartaoId);

            itens.push({

                nome: `Fatura ${cartao ? cartao.nome : "Cartão"}`,

                valor: grupo.valor,

                vencimento: `${grupo.mesReferencia}-01`

            });

        });

    }

    if (itens.length === 0) {

        return "Você não tem nenhum vencimento pendente no momento. 🎉";

    }

    itens.sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento));

    const linhas = itens.slice(0, 6).map(item => `• ${item.nome}: R$ ${item.valor.toFixed(2)}`);

    return `Aqui estão seus próximos vencimentos:\n\n${linhas.join("\n")}`;

}

// ================================
// Responder: Lista de Mercado
// ================================

function responderListaMercadoMia() {

    if (typeof listaMercadoAtual === "undefined" || listaMercadoAtual.length === 0) {

        return "Sua lista de mercado está vazia no momento.";

    }

    const linhas = listaMercadoAtual.map(item => `• ${item.produto} (${item.quantidade}x)`);

    return `Sua lista de mercado tem ${listaMercadoAtual.length} ${listaMercadoAtual.length === 1 ? "item" : "itens"}:\n\n${linhas.join("\n")}`;

}

// ================================
// Voz: Reconhecimento (falar com a Mia)
// ================================

function suportaReconhecimentoVoz() {

    return ("webkitSpeechRecognition" in window) || ("SpeechRecognition" in window);

}

// Botão do microfone: liga/desliga o modo contínuo
function alternarOuvirMia() {

    if (modoContinuoAtivo) {

        pararModoContinuo();

        return;

    }

    modoContinuoAtivo = true;

    atualizarStatusEscutaMia();

    iniciarOuvirMia();

}

// Encerra o modo contínuo por completo (botão, comando de voz, ou erro)
function pararModoContinuo() {

    modoContinuoAtivo = false;

    if (reconhecimentoVozMia) {

        try {

            reconhecimentoVozMia.stop();

        } catch (erro) {

            // já estava parado, tudo bem

        }

    }

    if ("speechSynthesis" in window) {

        window.speechSynthesis.cancel();

    }

    ouvindoVoz = false;

    atualizarBotaoMicMia();

    atualizarStatusEscutaMia();

}

// Reinicia a escuta automaticamente (chamado depois que a Mia termina de falar)
function reiniciarEscutaContinua() {

    if (!modoContinuoAtivo) return;

    if (ouvindoVoz) return;

    setTimeout(() => {

        if (modoContinuoAtivo && !ouvindoVoz) {

            iniciarOuvirMia();

        }

    }, 500);

}

function iniciarOuvirMia() {

    if (ouvindoVoz) return;

    if (!suportaReconhecimentoVoz()) {

        adicionarMensagemMia("Esse navegador não tem a API de reconhecimento de voz disponível.", false);

        renderizarChatMia();

        modoContinuoAtivo = false;

        atualizarStatusEscutaMia();

        return;

    }

    const SpeechRecognitionClasse = window.SpeechRecognition || window.webkitSpeechRecognition;

    reconhecimentoVozMia = new SpeechRecognitionClasse();

    reconhecimentoVozMia.lang = "pt-BR";

    reconhecimentoVozMia.interimResults = false;

    reconhecimentoVozMia.maxAlternatives = 1;

    resultadoRecebidoNestaSessao = false;

    reconhecimentoVozMia.onstart = () => {

        ouvindoVoz = true;

        atualizarBotaoMicMia();

        atualizarStatusEscutaMia();

    };

    reconhecimentoVozMia.onresult = (evento) => {

        resultadoRecebidoNestaSessao = true;

        const textoFalado = evento.results[0][0].transcript;

        const input = document.getElementById("chatInput");

        if (input) input.value = textoFalado;

        enviarMensagemMia();

    };

    reconhecimentoVozMia.onerror = (evento) => {

        ouvindoVoz = false;

        atualizarBotaoMicMia();

        const mensagensErro = {

            "not-allowed": "Preciso da sua permissão para usar o microfone. Verifique as permissões do site.",

            "permission-denied": "Preciso da sua permissão para usar o microfone. Verifique as permissões do site.",

            "audio-capture": "Não encontrei um microfone disponível neste dispositivo.",

            "network": "Falha de conexão com o serviço de reconhecimento de voz.",

            "service-not-allowed": "Este navegador bloqueou o serviço de reconhecimento de voz.",

            "aborted": null,

            "no-speech": null

        };

        const chaveErro = evento.error;

        // Erros graves encerram o modo contínuo por completo
        const errosGraves = ["not-allowed", "permission-denied", "audio-capture", "service-not-allowed"];

        if (errosGraves.includes(chaveErro)) {

            modoContinuoAtivo = false;

            atualizarStatusEscutaMia();

            const mensagem = mensagensErro[chaveErro];

            if (mensagem) {

                adicionarMensagemMia(mensagem, false);

                renderizarChatMia();

            }

        }

        // "no-speech" (silêncio) não é um erro grave: no modo contínuo,
        // simplesmente volta a ouvir de novo (tratado no onend)

    };

    reconhecimentoVozMia.onend = () => {

        ouvindoVoz = false;

        atualizarBotaoMicMia();

        // Se terminou sem capturar nenhuma fala (silêncio) e o modo contínuo
        // ainda está ativo, volta a ouvir automaticamente
        if (modoContinuoAtivo && !resultadoRecebidoNestaSessao) {

            reiniciarEscutaContinua();

        }

    };

    try {

        reconhecimentoVozMia.start();

    } catch (erro) {

        adicionarMensagemMia(`Não consegui iniciar o microfone (${erro.message || erro}).`, false);

        renderizarChatMia();

        modoContinuoAtivo = false;

        atualizarStatusEscutaMia();

    }

}

// ================================
// Voz: Síntese de fala (a Mia falando)
// ================================

function falarTextoMia(texto, aoTerminar) {

    if (!vozAtivadaMia || !("speechSynthesis" in window)) {

        if (typeof aoTerminar === "function") aoTerminar();

        return;

    }

    const textoLimpo = texto.replace(/[•\n]/g, ". ").replace(/\s+/g, " ").trim();

    window.speechSynthesis.cancel();

    const fala = new SpeechSynthesisUtterance(textoLimpo);

    fala.lang = "pt-BR";

    fala.rate = 1;

    if (typeof aoTerminar === "function") {

        fala.onend = aoTerminar;

        fala.onerror = aoTerminar;

    }

    window.speechSynthesis.speak(fala);

}

function alternarVozMia() {

    vozAtivadaMia = !vozAtivadaMia;

    localStorage.setItem("vozAtivadaMia", JSON.stringify(vozAtivadaMia));

    atualizarBotaoVozMia();

}

function atualizarBotaoVozMia() {

    const botao = document.getElementById("vozToggleMia");

    if (!botao) return;

    botao.textContent = vozAtivadaMia ? "🔊 Voz ligada" : "🔇 Voz desligada";

}

// ================================
// Atualizar visual do botão de microfone
// ================================

function atualizarBotaoMicMia() {

    const botao = document.getElementById("micBtnMia");

    if (!botao) return;

    if (ouvindoVoz || modoContinuoAtivo) {

        botao.classList.add("mic-ativo");

    } else {

        botao.classList.remove("mic-ativo");

    }

}

function atualizarStatusEscutaMia() {

    const status = document.getElementById("statusEscutaMia");

    if (!status) return;

    status.textContent = modoContinuoAtivo

        ? "🔁 Modo contínuo ativo — toque no microfone ou diga \"parar\" para encerrar"

        : "";

    atualizarBotaoMicMia();

}

// ================================
// Inicialização
// ================================

document.addEventListener("DOMContentLoaded", () => {

    renderizarChatMia();

    atualizarBotaoVozMia();

    atualizarStatusEscutaMia();

});
