// ================================
// Meu Financeiro - app.js
// ================================

const app = document.getElementById("app");

// -------------------------------
// Carregar páginas
// -------------------------------
async function carregarPagina(nomePagina) {
  
  try {
    
    const resposta = await fetch(`pages/${nomePagina}.html`);
    
    if (!resposta.ok) {
      throw new Error("Página não encontrada.");
    }
    
    const html = await resposta.text();
    
    app.innerHTML = html;
    
    // Carrega menu inferior
    try {
      
      const menu = await fetch("components/bottom-menu.html");
      
      if (menu.ok) {
        app.innerHTML += await menu.text();
      }
      
    } catch (e) {
      console.log("Menu não encontrado.");
    }
    
    atualizarDashboard();
    
    // Inicializa cada módulo quando sua página é carregada
    inicializarPagina(nomePagina);
    
    if (window.lucide) {
      lucide.createIcons();
    }
    
  } catch (erro) {
    
    app.innerHTML = `
            <div style="padding:30px;text-align:center;">
                <h2>Erro</h2>
                <p>${erro.message}</p>
            </div>
        `;
    
  }
  
}

// -------------------------------
// Inicialização específica de cada módulo
// -------------------------------
function inicializarPagina(nomePagina) {
  
  if (nomePagina === "bancos" && typeof listarContas === "function") {
    
    listarContas();
    
  }
  
  if (nomePagina === "financeiro") {
    
    if (typeof popularContasMovimento === "function") popularContasMovimento();
    
    if (typeof listarMovimentos === "function") listarMovimentos();
    
  }
  
  if (nomePagina === "cartoes") {
    
    if (typeof popularSelectCartoes === "function") popularSelectCartoes();
    
    if (typeof listarCartoes === "function") listarCartoes();
    
    if (typeof popularContasFatura === "function") popularContasFatura();
    
    if (typeof popularMesesFatura === "function") popularMesesFatura();
    
  }
  
  if (nomePagina === "casa") {
    
    if (typeof gerarLancamentosMesAtual === "function") gerarLancamentosMesAtual();
    
    if (typeof popularContasPagamentoCasa === "function") popularContasPagamentoCasa();
    
    if (typeof listarContasCasaFixas === "function") listarContasCasaFixas();
    
    if (typeof popularMesesCasa === "function") popularMesesCasa();
    
  }
  
  if (nomePagina === "mercado") {
    
    if (typeof listarItensMercado === "function") listarItensMercado();
    
    if (typeof popularContasMercado === "function") popularContasMercado();
    
    if (typeof popularVrMercado === "function") popularVrMercado();
    
    if (typeof listarHistoricoMercado === "function") listarHistoricoMercado();
    
  }
  
  if (nomePagina === "vr") {
    
    if (typeof gerarRecargaMesAtual === "function") gerarRecargaMesAtual();
    
    if (typeof listarVr === "function") listarVr();
    
    if (typeof popularVrCompraSelect === "function") popularVrCompraSelect();
    
    if (typeof listarHistoricoVr === "function") listarHistoricoVr();
    
  }
  
  if (nomePagina === "moto") {
    
    if (typeof preencherFormMetaMoto === "function") preencherFormMetaMoto();
    
    if (typeof renderProgressoMoto === "function") renderProgressoMoto();
    
    if (typeof listarAportesMoto === "function") listarAportesMoto();
    
    if (typeof popularCofrinhoSelect === "function") popularCofrinhoSelect();
    
    if (typeof listarCofrinhos === "function") listarCofrinhos();
    
    if (typeof listarHistoricoCofrinhos === "function") listarHistoricoCofrinhos();
    
  }
  
  if (nomePagina === "metas") {
    
    if (typeof listarMetas === "function") listarMetas();
    
    if (typeof popularMetaSelect === "function") popularMetaSelect();
    
    if (typeof listarHistoricoAportesMeta === "function") listarHistoricoAportesMeta();
    
  }
  
  if (nomePagina === "relatorios") {
    
    if (typeof popularMesesRelatorio === "function") popularMesesRelatorio();
    
    if (typeof popularAnosRelatorio === "function") popularAnosRelatorio();
    
    if (typeof alternarAbaRelatorio === "function") alternarAbaRelatorio("mensal");
    
  }
  
  if (nomePagina === "mia") {
    
    if (typeof renderizarChatMia === "function") renderizarChatMia();
    
    if (typeof atualizarBotaoVozMia === "function") atualizarBotaoVozMia();
    
  }
  
}

// -------------------------------
// Atualizar Dashboard
// -------------------------------
function atualizarDashboard() {
  
  atualizarSaudacao();
  
  atualizarData();
  
  if (typeof atualizarDashboardCompleto === "function") {
    
    atualizarDashboardCompleto();
    
  } else {
    
    atualizarSaldoTotal();
    
  }
  
}

// -------------------------------
// Saudação automática
// -------------------------------
function atualizarSaudacao() {
  
  const elemento = document.getElementById("saudacao");
  
  if (!elemento) return;
  
  const hora = new Date().getHours();
  
  let texto = "Olá";
  
  if (hora >= 5 && hora < 12) {
    texto = "Bom dia";
  }
  else if (hora >= 12 && hora < 18) {
    texto = "Boa tarde";
  }
  else {
    texto = "Boa noite";
  }
  
  elemento.innerHTML = `${texto}, Wellington 👋`;
  
}

// -------------------------------
// Data atual
// -------------------------------
function atualizarData() {
  
  const elemento = document.getElementById("dataAtual");
  
  if (!elemento) return;
  
  const hoje = new Date();
  
  const data = hoje.toLocaleDateString("pt-BR", {
    
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
    
  });
  
  elemento.innerHTML = data;
  
}

// -------------------------------
// Saldo Total (soma de todas as contas)
// -------------------------------
function atualizarSaldoTotal() {
  
  const elemento = document.getElementById("saldoTotal");
  
  if (!elemento) return;
  
  const total = (typeof saldoTotal === "function") ? saldoTotal() : 0;
  
  elemento.innerHTML = `R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
}

// -------------------------------
// Inicialização geral do app
// -------------------------------
window.addEventListener("load", () => {
  
  carregarPagina("dashboard");
  
});
