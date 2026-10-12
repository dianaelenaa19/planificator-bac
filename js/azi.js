// azi.js - ecranul „Azi" și notarea sesiunilor

import { getStare, salveaza, idNou } from "./storage.js";
import { azi, formateazaData } from "./utils.js";
import { actualizeaza } from "./algoritmi.js";

// Capitolul pentru care se completează acum formularul (id) sau null
let capitolAles = null;

function arataMesaj(text, reusit) {
  const element = document.getElementById("azi-mesaj");
  element.textContent = text;
  element.className = reusit ? "mesaj-ok" : "mesaj-eroare";
}

// Capitolele a căror dată de repetare a venit (sau a trecut)
// Temporar le ordonăm după dată, apoi după încredere (cea mai mică întâi).
// La Pasul 9 înlocuim ordonarea cu prioritatea.
function capitoleDeAzi() {
  const astazi = azi();

  return getStare().capitole
    .filter(function (c) {
      return c.urmatoareaRepetare <= astazi;
    })
    .sort(function (a, b) {
      if (a.urmatoareaRepetare < b.urmatoareaRepetare) return -1;
      if (a.urmatoareaRepetare > b.urmatoareaRepetare) return 1;
      return a.incredere - b.incredere;
    });
}

function numeMaterie(materieId) {
  const materie = getStare().materii.find(function (m) {
    return m.id === materieId;
  });
  return materie ? materie.nume : "?";
}

function inchideFormular() {
  capitolAles = null;
  const formular = document.getElementById("form-sesiune");
  formular.reset();
  formular.hidden = true;
}

function deschideFormular(capitol) {
  capitolAles = capitol.id;
  arataMesaj("", true);

  document.getElementById("sesiune-titlu").textContent =
    capitol.nume + " (" + numeMaterie(capitol.materieId) + ")";

  const formular = document.getElementById("form-sesiune");
  formular.hidden = false;
  formular.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Minutele învățate azi, adunate din toate sesiunile de azi
function minuteAzi() {
  const astazi = azi();
  return getStare().sesiuni
    .filter(function (s) {
      return s.data === astazi;
    })
    .reduce(function (suma, s) {
      return suma + s.minute;
    }, 0);
}

// Desenează lista de azi din datele salvate
export function deseneazaAzi() {
  arataMesaj("", true);

  const stare = getStare();
  const lista = document.getElementById("lista-azi");
  lista.innerHTML = "";

  // dacă formularul era deschis pentru un capitol care nu mai există, îl închidem
  if (capitolAles !== null) {
    const maiExista = stare.capitole.some(function (c) {
      return c.id === capitolAles;
    });
    if (!maiExista) {
      inchideFormular();
    }
  }

  const capitole = capitoleDeAzi();

  document.getElementById("azi-rezumat").textContent =
    "Capitole de repetat azi: " + capitole.length +
    " · Minute învățate azi: " + minuteAzi();

  if (capitole.length === 0) {
    const gol = document.createElement("li");
    gol.className = "fara-capitole";

    if (stare.capitole.length === 0) {
      gol.className = "fara-materii";
      gol.textContent = "Nu ai niciun capitol încă. Adaugă-le în secțiunea Materii.";
    } else {
      gol.textContent = "Ești la zi, bravo!";
    }

    lista.appendChild(gol);
    return;
  }

  capitole.forEach(function (capitol) {
    const li = document.createElement("li");

    const info = document.createElement("span");
    info.className = "info";
    info.textContent =
      capitol.nume + " (" + numeMaterie(capitol.materieId) + ")" +
      " - încredere: " + capitol.incredere + "/5";

    const buton = document.createElement("button");
    buton.textContent = "Am învățat";
    buton.addEventListener("click", function () {
      deschideFormular(capitol);
    });

    li.appendChild(info);
    li.appendChild(buton);
    lista.appendChild(li);
  });
}

// Leagă formularul de notare de funcțiile de mai sus
export function pornesteAzi() {
  document.getElementById("sesiune-anuleaza").addEventListener("click", inchideFormular);

  document.getElementById("form-sesiune").addEventListener("submit", function (eveniment) {
    eveniment.preventDefault();

    const stare = getStare();
    const capitol = stare.capitole.find(function (c) {
      return c.id === capitolAles;
    });

    if (!capitol) {
      inchideFormular();
      deseneazaAzi();
      return;
    }

    const scor = Number(document.getElementById("sesiune-scor").value);
    const minute = Number(document.getElementById("sesiune-minute").value);

    if (!Number.isInteger(minute) || minute < 1 || minute > 600) {
      arataMesaj("Scrie un număr de minute între 1 și 600.", false);
      return;
    }

    // algoritmul din Pasul 7 reprogramează capitolul
    actualizeaza(capitol, scor);

    // păstrăm sesiunea pentru statistici
    stare.sesiuni.push({
      id: idNou(),
      capitolId: capitol.id,
      data: azi(),
      scor: scor,
      minute: minute
    });

    salveaza();

    const mesaj =
      "Salvat! „" + capitol.nume + "” revine pe " +
      formateazaData(capitol.urmatoareaRepetare) + ".";

    inchideFormular();
    deseneazaAzi();
    arataMesaj(mesaj, true);
  });
}