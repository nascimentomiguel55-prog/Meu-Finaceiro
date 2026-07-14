// ================================
// Service Worker - Meu Financeiro
// ================================

// Sempre que você alterar arquivos do app de forma importante,
// aumente este número para forçar os celulares a baixarem a versão nova.
const VERSAO_CACHE = "meu-financeiro-v1";

const ARQUIVOS_PARA_CACHE = [
  
  "./",
  "./index.html",
  "./manifest.json",
  
  "./css/style.css",
  "./css/reset.css",
  "./css/variables.css",
  "./css/menu.css",
  "./css/dashboard.css",
  "./css/bancos.css",
  "./css/financeiro.css",
  "./css/cartoes.css",
  "./css/casa.css",
  "./css/mercado.css",
  "./css/vr.css",
  "./css/moto.css",
  "./css/metas.css",
  "./css/relatorios.css",
  "./css/mia.css",
  
  "./js/app.js",
  "./js/dashboard.js",
  "./js/bancos.js",
  "./js/financeiro.js",
  "./js/cartoes.js",
  "./js/casa.js",
  "./js/mercado.js",
  "./js/vr.js",
  "./js/moto.js",
  "./js/metas.js",
  "./js/relatorios.js",
  "./js/mia.js",
  
  "./pages/dashboard.html",
  "./pages/bancos.html",
  "./pages/financeiro.html",
  "./pages/cartoes.html",
  "./pages/casa.html",
  "./pages/mercado.html",
  "./pages/vr.html",
  "./pages/moto.html",
  "./pages/metas.html",
  "./pages/relatorios.html",
  "./pages/mia.html",
  
  "./components/bottom-menu.html",
  
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
  
];

// ================================
// Instalação: guarda os arquivos no cache
// ================================

self.addEventListener("install", (evento) => {
  
  evento.waitUntil(
    
    caches.open(VERSAO_CACHE).then((cache) => {
      
      // addAll falha inteiro se um arquivo faltar, então adicionamos
      // um por um e ignoramos os que derem erro (mais tolerante)
      return Promise.all(
        
        ARQUIVOS_PARA_CACHE.map((arquivo) =>
          
          cache.add(arquivo).catch((erro) => {
            
            console.log("Não foi possível cachear:", arquivo, erro);
            
          })
          
        )
        
      );
      
    })
    
  );
  
  self.skipWaiting();
  
});

// ================================
// Ativação: remove caches antigos
// ================================

self.addEventListener("activate", (evento) => {
  
  evento.waitUntil(
    
    caches.keys().then((nomesCache) => {
      
      return Promise.all(
        
        nomesCache
        
        .filter((nome) => nome !== VERSAO_CACHE)
        
        .map((nome) => caches.delete(nome))
        
      );
      
    })
    
  );
  
  self.clients.claim();
  
});

// ================================
// Fetch: tenta a rede primeiro, cai para o cache se offline
// (assim você sempre vê a versão mais nova quando tem internet,
// mas o app continua funcionando sem internet)
// ================================

self.addEventListener("fetch", (evento) => {
  
  if (evento.request.method !== "GET") return;
  
  evento.respondWith(
    
    fetch(evento.request)
    
    .then((respostaRede) => {
      
      const respostaClone = respostaRede.clone();
      
      caches.open(VERSAO_CACHE).then((cache) => {
        
        cache.put(evento.request, respostaClone);
        
      });
      
      return respostaRede;
      
    })
    
    .catch(() => {
      
      return caches.match(evento.request).then((respostaCache) => {
        
        return respostaCache || caches.match("./index.html");
        
      });
      
    })
    
  );
  
});
