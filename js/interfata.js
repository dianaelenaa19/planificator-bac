// interfata.js - desenarea paginii

import { getStare, salveaza, idNou } from "./storage.js";
import { azi, formateazaData } from "./utils.js";
import { deseneazaCapitole } from "./capitole.js";

// Dacă editezi o materie, aici ține minte care (altfel e null)
let idEditat = null;

/* ---------- Meniul (Pasul 2) ---------- */

export function arataSectiunea(id) {
  document.querySelectorAll("main section").forEach(function (sectiune) {
    sectiune.hidden = true;
  });

  document.getElementById(id).hidden = false;

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

/* ---------- Materii (Pasul 5) ---------- */

function arataMesaj(text) {
  document.getElementById("materie-mesaj").textContent = text;
}

// Readuce formularul la starea de „adăugare"
function resetFormular() {
  idEditat = null;
  document.getElementById("form-materie").reset();
  document.getElementById("materie-salveaza").textContent = "Adaugă materia";
  document.getElementById("materie-anuleaza").hidden = true;
  arataMesaj("");
}

// Pune datele unei materii în formular, ca s-o poți modifica
function pornesteEditarea(materie) {
  idEditat = materie.id;
  document.getElementById("materie-nume").value = materie.nume;
  document.getElementById("materie-data").value = materie.dataExamen;
  document.getElementById("materie-importanta").value = String(materie.importanta);
  document.getElementById("materie-salveaza").textContent = "Salvează modificările";
  document.getElementById("materie-anuleaza").hidden = false;
  arataMesaj("");
  document.getElementById("materie-nume").focus();
}

// Șterge o materie și toate capitolele ei
function stergeMaterie(materie) {
  const sigur = confirm("Ștergi materia „" + materie.nume + "” și toate capitolele ei?");
  if (!sigur) {
    return;
  }

  const stare = getStare();
  stare.materii = stare.materii.filter(function (m) {
    return m.id !== materie.id;
  });
  stare.capitole = stare.capitole.filter(function (c) {
    return c.materieId !== materie.id;
  });
  salveaza();

  if (idEditat === materie.id) {
    resetFormular();
  }
  deseneazaMaterii();
}

// Golește lista și o desenează din nou, după datele din stare
export function deseneazaMaterii() {
  deseneazaCapitole();
  const lista = document.getElementById("lista-materii");
  lista.innerHTML = "";

  const materii = getStare().materii.slice().sort(function (a, b) {
    if (a.dataExamen < b.dataExamen) return -1;
    if (a.dataExamen > b.dataExamen) return 1;
    return 0;
  });

  if (materii.length === 0) {
    const gol = document.createElement("li");
    gol.className = "fara-materii";
    gol.textContent = "Nu ai nicio materie adăugată încă.";
    lista.appendChild(gol);
    return;
  }

  materii.forEach(function (materie) {
    const li = document.createElement("li");

    const info = document.createElement("span");
    info.className = "info";
    info.textContent =
      materie.nume +
      " - examen: " + formateazaData(materie.dataExamen) +
      " - importanță: " + materie.importanta;

    const butonEdit = document.createElement("button");
    butonEdit.textContent = "Editează";
    butonEdit.className = "secundar";
    butonEdit.addEventListener("click", function () {
      pornesteEditarea(materie);
    });

    const butonSterge = document.createElement("button");
    butonSterge.textContent = "Șterge";
    butonSterge.className = "sterge";
    butonSterge.addEventListener("click", function () {
      stergeMaterie(materie);
    });

    li.appendChild(info);
    li.appendChild(butonEdit);
    li.appendChild(butonSterge);
    lista.appendChild(li);
  });
}

// Leagă formularul de funcțiile de mai sus
export function pornesteFormularMaterii() {
  const formular = document.getElementById("form-materie");

  formular.addEventListener("submit", function (eveniment) {
    eveniment.preventDefault();

    const nume = document.getElementById("materie-nume").value.trim();
    const data = document.getElementById("materie-data").value;
    const importanta = Number(document.getElementById("materie-importanta").value);

    if (nume === "") {
      arataMesaj("Scrie numele materiei.");
      return;
    }
    if (data === "") {
      arataMesaj("Alege data examenului.");
      return;
    }
    if (data < azi()) {
      arataMesaj("Data examenului a trecut deja. Alege o dată de azi încolo.");
      return;
    }

    const stare = getStare();

    if (idEditat === null) {
      // adăugare
      stare.materii.push({
        id: idNou(),
        nume: nume,
        dataExamen: data,
        importanta: importanta
      });
    } else {
      // editare
      const materie = stare.materii.find(function (m) {
        return m.id === idEditat;
      });
      materie.nume = nume;
      materie.dataExamen = data;
      materie.importanta = importanta;
    }

    salveaza();
    resetFormular();
    deseneazaMaterii();
  });

  document.getElementById("materie-anuleaza").addEventListener("click", resetFormular);
}