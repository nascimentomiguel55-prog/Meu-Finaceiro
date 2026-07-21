// ================================
// Contas Financeiras
// ================================

let contas = JSON.parse(localStorage.getItem("contas")) || [];

// ================================
// Salvar Conta
// ================================

function salvarConta() {
  
  const nome = document.getElementById("nomeConta").value.trim();
  
  const tipo = document.getElementById("tipoConta").value;
  
  const saldo = parseFloat(document.getElementById("saldoConta").value) || 0;
  
  if (nome === "") {
    
    alert("Informe o nome da conta.");
    
    return;
    
  }
  
  contas.push({
    
    id: Date.now(),
    
    nome,
    
    tipo,
    
    saldo
    
  });
  
  salvarLocal();
  
  limparFormulario();
  
  listarContas();
  
}

// ================================
// Salvar LocalStorage
// ================================

function salvarLocal() {
  
  localStorage.setItem("contas", JSON.stringify(contas));
  
}

// ================================
// Listar Contas
// ================================

function listarContas() {
  
  const lista = document.getElementById("listaContas");
  
  if (!lista) return;
  
  if (contas.length === 0) {
    
    lista.innerHTML = `

        <div class="empty">

            <i data-lucide="wallet"></i>

            <p>Nenhuma conta cadastrada.</p>

        </div>

        `;
    
    lucide.createIcons();
    
    return;
    
  }
  
  lista.innerHTML = "";
  
  contas.forEach(conta => {
    
    lista.innerHTML += `

        <div class="conta-item">

            <h4>${conta.nome}</h4>

            <p>${conta.tipo}</p>

            <strong>R$ ${conta.saldo.toFixed(2)}</strong>

            <br><br>

            <button class="delete-button"

            onclick="excluirConta(${conta.id})">

            Excluir

            </button>

        </div>

        `;
    
  });
  
}

// ================================
// Excluir
// ================================

function excluirConta(id) {
  
  if (!confirm("Deseja excluir esta conta?")) return;
  
  contas = contas.filter(c => c.id !== id);
  
  salvarLocal();
  
  listarContas();
  
}

// ================================
// Limpar Formulário
// ================================

function limparFormulario() {
  
  document.getElementById("nomeConta").value = "";
  
  document.getElementById("saldoConta").value = "";
  
}

// ================================
// Saldo Total
// ================================

function saldoTotal() {
  
  let total = 0;
  
  contas.forEach(c => {
    
    total += c.saldo;
    
  });
  
  return total;
  
}

// ================================
// Inicialização
// ================================

document.addEventListener("DOMContentLoaded", () => {
  
  listarContas();
  
});
