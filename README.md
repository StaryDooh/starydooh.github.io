# starydooh.github.io

Strona z moimi darmowymi programami: https://starydooh.github.io

## Struktura

```
index.html              strona główna – lista programów + wyszukiwarka
programy/_szablon.html  szablon podstrony programu (nie jest indeksowany)
programy/*.html         podstrony programów
css/style.css           wygląd (jasny/ciemny motyw automatycznie)
js/szukaj.js            filtrowanie listy na stronie głównej
js/program.js           pobiera z GitHub: najnowsze wydanie, dane repo, README
sitemap.xml, robots.txt dla wyszukiwarek
.nojekyll               publikacja plików bez przetwarzania przez Jekyll
```

## Jak dodać nowy program

1. Skopiuj `programy/_szablon.html` jako `programy/nazwa.html` i podmień `NAZWA_PROGRAMU`, `NAZWA_REPO`, `nazwa.html` oraz `OPIS_*`.
2. W `index.html` skopiuj jeden blok `<li class="karta">…</li>` i zmień nazwę, opis oraz linki.
3. Dopisz adres podstrony do `sitemap.xml`.

## Pobieranie najnowszej wersji

Przycisk „Pobierz” korzysta z sekcji **Releases** repozytorium programu:
na stronie repo → *Releases* → *Draft a new release*, tag np. `v1.0.0.0`, dołącz plik `Setup_….exe`.
Strona sama wybierze pierwszy plik `.exe`/`.msi` (albo `.zip`) z najnowszego wydania.

Jeśli program nie ma jeszcze wydań, w podstronie dodaj do `<main>` atrybut
`data-pobierz="https://github.com/StaryDooh/REPO/tree/main/Setup_…"`.
