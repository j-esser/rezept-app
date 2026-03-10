# Meine Rezepte — Web-App

Eine lokale Web-Applikation zur Rezeptverwaltung, Wochenplanung und Einkaufslistengenerierung. Läuft vollständig im Browser, kein Server, kein Build-Tool.

---

## Starten

Doppelklick auf `index.html` → öffnet sich direkt im Browser via `file://`.

---

## Dateien

| Datei | Beschreibung |
|---|---|
| `index.html` | HTML-Skelett, lädt Tailwind CSS und mammoth.js via CDN |
| `app.js` | Gesamte Anwendungslogik (~2200 Zeilen, 12 Sektionen) |
| `styles.css` | Custom CSS (Tab-Leiste, Karten, Buttons, Print-Styles) |
| `baseline-recipes.js` | 40 Basis-Rezepte — werden automatisch geladen wenn localStorage leer ist |
| `reset.html` | Hilfstool: löscht alle gespeicherten Daten (localStorage) |

---

## Features

### Rezepte
- Anlegen, bearbeiten, löschen
- Felder: Titel, Kategorien (Tags), Kochzeit (Minuten), Portionen, Referenz (Kochbuch/URL), Zutaten mit Mengenangabe, Zubereitungsbeschreibung
- Jede Zutat wird automatisch einer Einkaufskategorie zugewiesen (siehe Klassifikation)
- Beim ersten Start werden 40 Basis-Rezepte automatisch geladen (`baseline-recipes.js`)

### Kategorien-Reiter
Rezepte werden über eine horizontale Tab-Leiste gefiltert:

`Alle` · `Pasta` · `Reis` · `Curry` · `Suppe` · `Fisch` · `Fleisch` · `Vegetarisch` · `Salat` · `Eintopf` · `Ohne Kategorie`

Jeder Tab zeigt die Anzahl der Rezepte in dieser Kategorie. Zusätzlich steht eine Freitextsuche zur Verfügung (filtert Titel, Zutaten, Beschreibung, Kategorien).

### Wochenliste
- Rezepte per Knopfdruck zur Wochenliste hinzufügen — beim Hinzufügen wird die gewünschte Portionszahl abgefragt
- Portionszahl pro Rezept nachträglich anpassbar (direkt in der Wochenliste)
- Immer sichtbares Panel auf der rechten Seite

### Einkaufsliste
- Automatisch aus allen Rezepten der Wochenliste generiert
- Zutaten werden **rezeptbezogen skaliert**: Skalierungsfaktor = gewählte Portionen ÷ Rezept-Portionen
- Gleiche Zutaten werden zusammengeführt: `800 g (400 g + 400 g)`
- Zutaten werden nach Einkaufskategorien gruppiert
- Checkboxen zum Abhaken beim Einkaufen
- Kategorien ein-/ausklappbar

#### Export-Optionen

| Button | Funktion |
|---|---|
| 📋 In Zwischenablage | Liste als Text kopieren |
| 🍎 Erinnerungen (macOS) | `.applescript` herunterladen → in Script Editor öffnen → ▶ ausführen → Liste erscheint in Apple Erinnerungen |
| 📄 Als Text | `.txt`-Datei herunterladen |
| 🖨️ Drucken | Druckansicht (nur Einkaufsliste, keine Sidebar) |

### Import aus .docx
1. **Kategorie wählen** (gilt für alle Rezepte in der Datei)
2. **.docx-Datei wählen** — mammoth.js extrahiert den Plain-Text im Browser
3. **Vorschau**: erkannte Rezepte mit Titel und Zutatenanzahl
4. **Importieren**: bereits vorhandene Rezepte (gleicher Titel) werden übersprungen

---

## Datenmodell

Daten werden in `localStorage` gespeichert (kein Server).

```
localStorage['rezepte']      → JSON-Array aller Rezepte
localStorage['wochenliste']  → JSON-Array von { id, portions }
```

### Recipe
```javascript
{
  id:          string,       // "r_<timestamp>_<random>"
  title:       string,
  categories:  string[],     // z.B. ["Pasta", "Vegetarisch"]
  cookTime:    number,       // Kochzeit in Minuten (default: 40)
  portions:    number,       // Portionen (default: 2)
  reference:   string,       // Kochbuch, URL o.ä. (optional)
  description: string,
  ingredients: Ingredient[]
}
```

### Wochenliste
```javascript
localStorage['wochenliste']  → JSON-Array von { id: string, portions: number }
```

### Ingredient
```javascript
{
  name:         string,      // z.B. "Spaghetti"
  amount:       string,      // z.B. "400 g"
  shopCategory: string       // automatisch zugewiesen
}
```

---

## Zutaten-Klassifikation

Jede Zutat wird automatisch einer der folgenden Einkaufskategorien zugewiesen:

| Kategorie | Beispiele |
|---|---|
| 🥦 Gemüse & Obst | Möhren, Zwiebeln, Paprika, Tomaten, Ingwer, Kräuter |
| 🌾 Trockensortiment | Nudeln, Reis, Linsen, Kokosmilch, Tomatenmark, Brühe |
| ❄️ Tiefkühl | Tiefkühl-Produkte, TK-Spinat |
| 🧀 Mopro | Milch, Sahne, Butter, Käse, Eier, Joghurt |
| 🥩 Fleisch & Fisch | Hähnchen, Hackfleisch, Lachs, Garnelen |
| 🫙 Vorrat | Salz, Pfeffer, Öle, Essig, alle Gewürze, Backpulver |
| 🛍️ Sonstiges | Alles nicht Erkannte |

**Algorithmus**: Substring-Match (case-insensitive) gegen ein Wörterbuch. Bei mehreren Treffern gewinnt der längste Treffer (*Longest-Match*), damit z.B. „Tomatenmark" korrekt als Trockensortiment eingeordnet wird und nicht als Gemüse & Obst (via „Tomate").

---

## .docx Import-Format

Die Datei muss kein fixes Format haben. Der Parser verwendet eine State Machine:

1. Text wird an Leerzeilen (`\n\n`) in Blöcke aufgeteilt
2. Jeder Block wird klassifiziert: **Titel** / **Zutaten** / **Beschreibung**
   - Ein einzeiliger Block ohne Kochverben und ohne Satzzeichen am Ende → Titel
   - Mehrheit der Zeilen beginnen mit Zahl/Maßeinheit → Zutaten
   - Sonst → Beschreibung
3. Blöcke werden per Zustandsübergang zu Rezepten zusammengebaut

**Erkannte Maßeinheiten**: g, kg, ml, cl, dl, l, EL, TL, Esslöffel, Teelöffel, Prise, Bund, Dose, Glas, Packung, Päckchen, Paket, Tüte, Stück, Scheibe, Zehe, Handvoll, Tasse u.v.m.

**Mengen-Parsing**:
- `"400g Spaghetti"` → amount: `400 g`, name: `Spaghetti`
- `"1 Esslöffel Olivenöl"` → amount: `1 Esslöffel`, name: `Olivenöl`
- `"reichlich Salz"` → amount: `reichlich`, name: `Salz`
- `"Lorbeerblatt"` → amount: `""`, name: `Lorbeerblatt`
- `"Salz und Pfeffer"` → zwei separate Zutaten
- `"Salz, Pfeffer"` → zwei separate Zutaten
- `"Paprika, rot und gelb"` → eine Zutat (Farbe/Deskriptor wird erkannt)

---

## Portionsskalierung

Jedes Rezept hat eine eigene Portionszahl. Beim Hinzufügen zur Wochenliste wird die gewünschte Portionszahl festgelegt. Der Skalierungsfaktor für die Einkaufsliste ergibt sich daraus:

```
Faktor = gewählte Portionen ÷ Rezept-Portionen
```

Beispiel: Rezept für 2 Portionen, gewählt 4 → Faktor 2:
- `"400 g"` × 2 → `"800 g"`
- `"2 EL"` × 2 → `"4 EL"`
- `"1 Prise"` × 2 → `"2 Prise"`
- `"etwas Salz"` → unverändert (nicht-numerisch)
- Brüche (`½`, `¼`, `¾`) werden korrekt berechnet

---

## Layout

```
┌──────────────┬────────────────────────────────┬──────────────────┐
│   SIDEBAR    │         MAIN CONTENT           │   WOCHENLISTE    │
│              │                                │                  │
│ 🍽️ Meine     │  Alle · Pasta · Suppe · …     │  • Carbonara     │
│   Rezepte    │  ──────────────────────────   │  • Linsensuppe   │
│              │  [🔍 Suche...]                 │                  │
│ ○ Rezepte    │                                │  [🛒 Einkaufsli.]│
│ ○ Wochenl.   │  ┌──────┐ ┌──────┐ ┌──────┐  │  [Leeren]        │
│ ○ Einkaufsl. │  │Karte │ │Karte │ │Karte │  │                  │
│ ○ Importieren│  └──────┘ └──────┘ └──────┘  │                  │
│              │                                │                  │
│ [+ Neu]      │                                │                  │
└──────────────┴────────────────────────────────┴──────────────────┘
```

---

## Technologie

- **Vanilla HTML/CSS/JavaScript** — kein Framework, kein Build-Tool
- **Tailwind CSS** v3 via Play CDN
- **mammoth.js** v1.8 via CDN — konvertiert `.docx` → Plain Text im Browser
- **localStorage** — Datenpersistenz, kein Server nötig

### app.js Struktur

| Sektion | Inhalt |
|---|---|
| 1 · Constants | RECIPE_TABS, SHOP_CATEGORIES, INGREDIENT_DICTIONARY |
| 2 · State | Zentrales State-Objekt |
| 3 · Storage | localStorage laden/speichern |
| 4 · RecipeStore | CRUD + Filterlogik |
| 5 · WochenlisteStore | Wochenliste verwalten |
| 6 · Classifier | Longest-Match Zutaten-Klassifikation |
| 7 · DocxParser | State-Machine Parser für .docx-Import |
| 8 · ShoppingList | Generierung, Skalierung, Exporte |
| 9 · Render | HTML-Generierung aller Views und Komponenten |
| 10 · Handlers | Event-Delegation (data-action Attribute) |
| 11 · Router | Tab-Navigation, Teil-Re-Renders |
| 12 · Init | App-Start, Event-Listener |

---

## Daten zurücksetzen

`reset.html` im Browser öffnen → „Alle Daten löschen" klicken. Löscht `localStorage['rezepte']` und `localStorage['wochenliste']`.
