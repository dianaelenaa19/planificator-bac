// capitole.js - gestionarea capitolelor

import { getStare, salveaza, idNou } from "./storage.js";
import { azi } from "./utils.js";

// Dacă editezi un capitol, aici ține minte care (altfel e null)
let idEditat = null;

// Materia pentru care se văd capitolele (id-ul ei)
let materieAleasa = null;

function arataMesaj(text, reusit) {
  const element = document.getElementById("capitol-mesaj");
  element.textContent = text;
  element.className = reusit ? "mesaj-ok" : "mesaj-eroare";
}

// Readuce formularul la starea de „adăugare"
function resetFormular() {
  idEditat = null;
  document.getElementById("form-capitol").reset();
  document.getElementById("capitol-salveaza").textContent = "Adaugă capitolul";
  document.getElementById("capitol-anuleaza").hidden = true;
  arataMesaj("", false);
}

// Pune datele unui capitol în formular, ca să-l poți modifica
function pornesteEditarea(capitol) {
  idEditat = capitol.id;
  document.getElementById("capitol-nume").value = capitol.nume;
  document.getElementById("capitol-incredere").value = String(capitol.incredere);
  document.getElementById("capitol-salveaza").textContent = "Salvează modificările";
  document.getElementById("capitol-anuleaza").hidden = false;
  arataMesaj("", false);
  document.getElementById("capitol-nume").focus();
}

function stergeCapitol(capitol) {
  const sigur = confirm("Ștergi capitolul „" + capitol.nume + "”?");
  if (!sigur) {
    return;
  }

  const stare = getStare();
  stare.capitole = stare.capitole.filter(function (c) {
    return c.id !== capitol.id;
  });
  salveaza();

  if (idEditat === capitol.id) {
    resetFormular();
  }
  deseneazaCapitole();
}

// Reface lista de materii din select și lista de capitole a materiei alese
export function deseneazaCapitole() {
  const stare = getStare();
  const select = document.getElementById("capitol-materie");
  const lista = document.getElementById("lista-capitole");

  const materii = stare.materii.slice().sort(function (a, b) {
    if (a.dataExamen < b.dataExamen) return -1;
    if (a.dataExamen > b.dataExamen) return 1;
    return 0;
  });

  // Dacă materia aleasă nu mai există (sau nu e aleasă niciuna), o luăm pe prima
  const exista = materii.some(function (m) {
    return m.id === materieAleasa;
  });
  if (!exista) {
    materieAleasa = materii.length > 0 ? materii[0].id : null;
  }

  select.innerHTML = "";
  materii.forEach(function (m) {
    const optiune = document.createElement("option");
    optiune.value = String(m.id);
    optiune.textContent = m.nume;
    select.appendChild(optiune);
  });
  if (materieAleasa !== null) {
    select.value = String(materieAleasa);
  }

  // Dacă editai un capitol care a dispărut (de ex. materia a fost ștearsă)
  if (idEditat !== null) {
    const maiExista = stare.capitole.some(function (c) {
      return c.id === idEditat;
    });
    if (!maiExista) {
      resetFormular();
    }
  }

  lista.innerHTML = "";

  if (materieAleasa === null) {
    const gol = document.createElement("li");
    gol.className = "fara-materii";
    gol.textContent = "Adaugă întâi o materie, mai sus.";
    lista.appendChild(gol);
    return;
  }

  const capitole = stare.capitole.filter(function (c) {
    return c.materieId === materieAleasa;
  });

  if (capitole.length === 0) {
    const gol = document.createElement("li");
    gol.className = "fara-materii";
    gol.textContent = "Această materie nu are încă niciun capitol.";
    lista.appendChild(gol);
    return;
  }

  capitole.forEach(function (capitol) {
    const li = document.createElement("li");

    const info = document.createElement("span");
    info.className = "info";
    info.textContent = capitol.nume + " - încredere: " + capitol.incredere + "/5";

    const butonEdit = document.createElement("button");
    butonEdit.textContent = "Editează";
    butonEdit.className = "secundar";
    butonEdit.addEventListener("click", function () {
      pornesteEditarea(capitol);
    });

    const butonSterge = document.createElement("button");
    butonSterge.textContent = "Șterge";
    butonSterge.className = "sterge";
    butonSterge.addEventListener("click", function () {
      stergeCapitol(capitol);
    });

    li.appendChild(info);
    li.appendChild(butonEdit);
    li.appendChild(butonSterge);
    lista.appendChild(li);
  });
}

// Creează obiectul unui capitol nou
function capitolNou(nume, incredere) {
  return {
    id: idNou(),
    materieId: materieAleasa,
    nume: nume,
    incredere: incredere,
    interval: 0,
    factor: 2.5,
    urmatoareaRepetare: azi(),
    repetari: 0
  };
}

// Leagă formularele și select-ul de funcțiile de mai sus
export function pornesteFormularCapitole() {
  // schimbarea materiei
  document.getElementById("capitol-materie").addEventListener("change", function (eveniment) {
    materieAleasa = Number(eveniment.target.value);
    resetFormular();
    deseneazaCapitole();
  });

  // adăugare / editare capitol
  document.getElementById("form-capitol").addEventListener("submit", function (eveniment) {
    eveniment.preventDefault();

    const nume = document.getElementById("capitol-nume").value.trim();
    const incredere = Number(document.getElementById("capitol-incredere").value);

    if (materieAleasa === null) {
      arataMesaj("Adaugă și alege mai întâi o materie.", false);
      return;
    }
    if (nume === "") {
      arataMesaj("Scrie numele capitolului.", false);
      return;
    }

    const stare = getStare();

    if (idEditat === null) {
      stare.capitole.push(capitolNou(nume, incredere));
    } else {
      const capitol = stare.capitole.find(function (c) {
        return c.id === idEditat;
      });
      capitol.nume = nume;
      capitol.incredere = incredere;
    }

    salveaza();
    resetFormular();
    deseneazaCapitole();
  });

  document.getElementById("capitol-anuleaza").addEventListener("click", resetFormular);

  // adăugare în masă
  document.getElementById("form-masa").addEventListener("submit", function (eveniment) {
    eveniment.preventDefault();

    if (materieAleasa === null) {
      arataMesaj("Adaugă și alege mai întâi o materie.", false);
      return;
    }

    const incredere = Number(document.getElementById("masa-incredere").value);
    const nume = document.getElementById("capitole-text").value
      .split("\n")
      .map(function (linie) {
        return linie.trim();
      })
      .filter(function (linie) {
        return linie !== "";
      });

    if (nume.length === 0) {
      arataMesaj("Scrie cel puțin un capitol (unul pe linie).", false);
      return;
    }

    const stare = getStare();
    nume.forEach(function (n) {
      stare.capitole.push(capitolNou(n, incredere));
    });

    salveaza();
    document.getElementById("capitole-text").value = "";
    deseneazaCapitole();
    arataMesaj("Am adăugat " + nume.length + " capitole.", true);
  });
}