// algoritmi.js - repetare spațiată și planificare

import { azi, adaugaZile } from "./utils.js";

// Actualizează un capitol după o sesiune de învățat.
// scor: de la 1 (nu știu nimic) la 5 (știu perfect)
export function actualizeaza(capitol, scor) {
  if (scor < 3) {
    // Nu l-am știut: reluăm de la început
    capitol.interval = 1;
    capitol.repetari = 0;
    capitol.factor = Math.max(1.3, capitol.factor - 0.2);
  } else {
    // L-am știut: creștem intervalul
    capitol.repetari++;

    if (capitol.repetari === 1) {
      capitol.interval = 1;
    } else if (capitol.repetari === 2) {
      capitol.interval = 3;
    } else {
      capitol.interval = Math.round(capitol.interval * capitol.factor);
    }

    // Factorul crește dacă a fost ușor și scade dacă a fost doar „așa și așa"
    const factorNou = capitol.factor + (scor - 3) * 0.1;
    capitol.factor = Math.max(1.3, Math.round(factorNou * 100) / 100);
  }

  capitol.incredere = scor;
  capitol.urmatoareaRepetare = adaugaZile(azi(), capitol.interval);
}