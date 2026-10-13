# Vitrum

*Vitrum* is Latijn voor glas: een venster op mijn wereld. Tools, gadgets en andere bijzondere dingen die ik onderweg tegenkom. De site wordt automatisch gebouwd met [Eleventy](https://www.11ty.dev/) en gepubliceerd op GitHub Pages.

Iedereen kan de site bekijken. Alleen de eigenaar van deze repository kan vondsten toevoegen.

## Een vondst toevoegen

**Via het formulier (ook op je gsm):**

1. Ga naar **Issues → New issue → Nieuwe vondst**.
2. Vul naam, link, soort en een korte beschrijving in. Meer uitleg en een afbeelding zijn optioneel; een screenshot kun je gewoon in het vak slepen.
3. Klik op **Create**. Binnen een minuut of twee staat de vondst online en wordt het issue automatisch afgesloten met een link.

Formulieren van andere mensen worden genegeerd.

**Rechtstreeks als bestand:** maak in `src/vondsten/` een bestand `JJJJ-MM-DD-naam.md`:

```markdown
---
title: TileDropper
link: https://tiledropper.github.io/TileDropper/app.html
soort: Muziek
samenvatting: Eén of twee zinnen voor op de kaart.
afbeelding: assets/img/tiledropper.png   # optioneel
date: 2026-10-13
---

Optioneel: meer uitleg voor de pagina van de vondst.
```

## Soorten en kleuren

De soorten (Tools, Gadgets, Muziek, Film & foto, Maken, Natuur, Overig) en hun kleuren staan in `src/_data/site.json`. Voeg je een soort toe, zet ze dan ook in het formulier `.github/ISSUE_TEMPLATE/nieuwe-vondst.yml`.

## Lokaal bekijken

```sh
npm install
npm start
```
