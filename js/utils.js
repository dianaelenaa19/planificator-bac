// utils.js - funcții ajutătoare pentru date calendaristice
// Datele sunt text de forma "AAAA-LL-ZZ", de exemplu "2026-10-11"

// Transformă un obiect Date în text "AAAA-LL-ZZ" (după ora locală)
function dinDate(d) {
  const an = d.getFullYear();
  const luna = String(d.getMonth() + 1).padStart(2, "0");
  const zi = String(d.getDate()).padStart(2, "0");
  return an + "-" + luna + "-" + zi;
}

// Transformă textul "AAAA-LL-ZZ" în obiect Date (la prânz, ca să evităm probleme cu ora de vară)
function dinText(text) {
  const parti = text.split("-");
  return new Date(Number(parti[0]), Number(parti[1]) - 1, Number(parti[2]), 12, 0, 0);
}

// Data de azi, ca text
export function azi() {
  return dinDate(new Date());
}

// Data peste n zile (n poate fi și negativ)
export function adaugaZile(data, n) {
  const d = dinText(data);
  d.setDate(d.getDate() + n);
  return dinDate(d);
}

// Câte zile sunt de la d1 până la d2 (negativ dacă d2 e înaintea lui d1)
export function diferentaZile(d1, d2) {
  const milisecundePeZi = 24 * 60 * 60 * 1000;
  return Math.round((dinText(d2) - dinText(d1)) / milisecundePeZi);
}

// Afișează data frumos, de exemplu "11 oct."
export function formateazaData(data) {
  const luni = ["ian.", "feb.", "mar.", "apr.", "mai", "iun.",
                "iul.", "aug.", "sept.", "oct.", "nov.", "dec."];
  const d = dinText(data);
  return d.getDate() + " " + luni[d.getMonth()];
}