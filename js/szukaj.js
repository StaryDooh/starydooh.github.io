// Filtrowanie listy programów na stronie głównej (bez wywołań API).
(() => {
  'use strict';
  const pole = document.getElementById('szukaj');
  const karty = [...document.querySelectorAll('#lista > .karta')];
  const brak = document.getElementById('brak');
  if (!pole) return;

  // Usuwa polskie znaki, żeby "zolw" znajdował "żółw".
  const normalizuj = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');
  const teksty = karty.map(k => normalizuj(k.textContent + ' ' + (k.dataset.szukaj || '')));

  pole.addEventListener('input', () => {
    const slowa = normalizuj(pole.value).split(/\s+/).filter(Boolean);
    let widoczne = 0;
    karty.forEach((k, i) => {
      const pasuje = slowa.every(s => teksty[i].includes(s));
      k.hidden = !pasuje;
      if (pasuje) widoczne++;
    });
    brak.hidden = widoczne > 0;
  });
})();
