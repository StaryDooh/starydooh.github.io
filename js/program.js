// Podstrona programu: pobiera z GitHub najnowsze wydanie, informacje o repozytorium i README.
// Nazwę repozytorium bierze z atrybutu data-repo elementu <main>.
(() => {
  'use strict';

  const WLASCICIEL = 'StaryDooh';
  const CACHE_MINUT = 60; // GitHub pozwala na 60 zapytań/godz. z jednego adresu IP (np. cała szkoła!)

  const main = document.querySelector('main[data-repo]');
  if (!main) return;
  const repo = main.dataset.repo;
  const api = `https://api.github.com/repos/${WLASCICIEL}/${repo}`;
  const urlRepo = `https://github.com/${WLASCICIEL}/${repo}`;
  const zapasowyLink = main.dataset.pobierz || `${urlRepo}/releases/latest`;
  const $ = id => document.getElementById(id);
  const data = s => new Date(s).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

  // --- prosty cache w localStorage (oszczędza limit zapytań) ---
  function zCache(klucz) {
    try {
      const w = JSON.parse(localStorage.getItem(klucz));
      if (w && Date.now() - w.t < CACHE_MINUT * 60000) return w.d;
    } catch (e) { /* brak dostępu do localStorage */ }
    return undefined;
  }
  function doCache(klucz, d) {
    try { localStorage.setItem(klucz, JSON.stringify({ t: Date.now(), d })); } catch (e) { /* pełny lub zablokowany */ }
  }

  async function zapytaj(sciezka, accept = 'application/vnd.github+json', jakoTekst = false) {
    const klucz = `gh:${repo}:${sciezka}`;
    const c = zCache(klucz);
    if (c !== undefined) return c;
    const odp = await fetch(api + sciezka, { headers: { Accept: accept } });
    if (odp.status === 404) { doCache(klucz, null); return null; }
    if (odp.status === 403 || odp.status === 429) throw new Error('limit');
    if (!odp.ok) throw new Error(`HTTP ${odp.status}`);
    const d = jakoTekst ? await odp.text() : await odp.json();
    doCache(klucz, d);
    return d;
  }

  // --- najnowsze wydanie (Releases) ---
  async function wydanie() {
    const przycisk = $('pobierz');
    const w = await zapytaj('/releases/latest');
    if (!w) { przycisk.href = zapasowyLink; $('wersja').textContent = 'brak wydań'; return; }

    const plik = w.assets.find(a => /\.(exe|msi)$/i.test(a.name)) || w.assets.find(a => /\.zip$/i.test(a.name));
    przycisk.href = plik ? plik.browser_download_url : w.html_url;
    if (plik) $('pobierz-opis').textContent = `${plik.name} · ${(plik.size / 1048576).toFixed(1)} MB`;

    $('wersja').textContent = w.tag_name;
    $('data-wydania').textContent = data(w.published_at);
    if (w.body && w.body.trim()) {
      $('nowosci-tekst').textContent = w.body.trim(); // tekst, nie HTML – bezpiecznie
      $('nowosci').hidden = false;
    }
  }

  // --- dane repozytorium ---
  async function informacje() {
    const r = await zapytaj('');
    if (!r) return;
    $('aktualizacja').textContent = data(r.pushed_at);
    if (r.license && r.license.name && r.license.spdx_id !== 'NOASSERTION') $('licencja').textContent = r.license.name;
    if (r.topics && r.topics.length) {
      const ul = $('tematy');
      r.topics.forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.append(li); });
    }
  }

  // --- README wyrenderowane przez GitHub do HTML ---
  async function readme() {
    const pole = $('readme');
    const html = await zapytaj('/readme', 'application/vnd.github.html+json', true);
    if (!html) { pole.innerHTML = '<p>Ten program nie ma jeszcze opisu README.</p>'; return; }
    pole.innerHTML = html;

    // Względne ścieżki obrazków i linków z README kierujemy do repozytorium.
    const surowe = `https://raw.githubusercontent.com/${WLASCICIEL}/${repo}/HEAD/`;
    const blob = `${urlRepo}/blob/HEAD/`;
    const wzgledna = s => s && !/^([a-z]+:|\/\/|#|data:)/i.test(s);
    pole.querySelectorAll('img[src]').forEach(img => {
      const s = img.getAttribute('src');
      if (wzgledna(s)) img.src = new URL(s.replace(/^\.?\//, ''), surowe).href;
      img.loading = 'lazy';
    });
    pole.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (wzgledna(h)) a.href = new URL(h.replace(/^\.?\//, ''), blob).href;
    });
  }

  function blad(e) {
    const komunikat = e && e.message === 'limit'
      ? 'GitHub chwilowo ograniczył liczbę zapytań z Twojej sieci. Spróbuj za godzinę.'
      : 'Nie udało się pobrać danych z GitHub.';
    $('readme').innerHTML = '';
    const p = document.createElement('p');
    p.className = 'uwaga';
    p.append(komunikat + ' ', Object.assign(document.createElement('a'), { href: urlRepo, textContent: 'Zobacz program na GitHub' }), '.');
    $('readme').append(p);
  }

  $('link-github').href = urlRepo;
  wydanie().catch(() => { $('pobierz').href = zapasowyLink; });
  informacje().catch(() => {});
  readme().catch(blad);
})();
