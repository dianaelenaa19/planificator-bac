// storage.js - salvarea și încărcarea datelor

const CHEIE = "planificatorBac";

// Starea aplicației: toate datele stau aici
let stare = {
  materii: [],
  capitole: [],
  sesiuni: [],
  setari: { oreZi: 3 }
};

// Citește datele salvate în browser (dacă există)
export function incarca() {
  try {
    const salvat = localStorage.getItem(CHEIE);
    if (salvat) {
      stare = JSON.parse(salvat);
    }
  } catch (eroare) {
    console.error("Nu am putut citi datele salvate:", eroare);
  }
  return stare;
}

// Scrie datele în browser
export function salveaza() {
  try {
    localStorage.setItem(CHEIE, JSON.stringify(stare));
  } catch (eroare) {
    console.error("Nu am putut salva datele:", eroare);
  }
}

// Returnează starea curentă
export function getStare() {
  return stare;
}

// Generează un identificator unic pentru materii, capitole etc.
let ultimulId = 0;

export function idNou() {
  let id = Date.now();
  if (id <= ultimulId) {
    id = ultimulId + 1;
  }
  ultimulId = id;
  return id;
}