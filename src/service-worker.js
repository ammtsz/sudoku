let arquivos = [
    "/",
    "css/styles.css",
    "css/bootstrap.css",

    "js/bootstrap.bundle.min.js",
    "js/sudoku.js",
    "js/validation.js",
    "js/scripts.js",
    
    "img/logo-dark.svg",
    "img/logo-light.svg",
    "img/logo.jpg",
  ];
  
  let versao = 0

  
  self.addEventListener("activate", function () {
    caches.open("sudoku-arquivos-" + versao).then((cache) => {
      cache.addAll(arquivos).then(function () {
        caches.delete("sudoku-arquivos-" + (versao-1));
      });
    });
  });
  
  // self para acessar o serviceWorker
  self.addEventListener("fetch", function (event) {
  
    let pedido = event.request;
    let promiseResposta = caches
      .match(pedido)
      .then((respostaCache) => {
        let resposta = respostaCache ? respostaCache : fetch(pedido);
        return resposta;
    });
  
    event.respondWith(promiseResposta);
  });
  