// interfata.js - desenarea paginii

export function arataSectiunea(id) {
  // ascunde toate secțiunile
  document.querySelectorAll("main section").forEach(function (sectiune) {
    sectiune.hidden = true;
  });

  // arată doar secțiunea aleasă
  document.getElementById(id).hidden = false;

  // marchează butonul activ din meniu
  document.querySelectorAll("nav button").forEach(function (buton) {
    buton.classList.toggle("activ", buton.dataset.sectiune === id);
  });
}

export function pornesteMeniul() {
  document.querySelectorAll("nav button").forEach(function (buton) {
    buton.addEventListener("click", function () {
      arataSectiunea(buton.dataset.sectiune);
    });
  });
}