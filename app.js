/* ============================================================
   REZEPT-APP — app.js
   Vanilla JS, no framework, no build tools.
============================================================ */

// ============================================================
// SECTION 1: CONSTANTS & CONFIG
// ============================================================

const STORAGE_KEYS = {
  RECIPES:     'rezepte',
  WOCHENLISTE: 'wochenliste',
};

const RECIPE_TABS = [
  'Alle', 'Pasta', 'Reis', 'Curry', 'Suppe',
  'Fisch', 'Fleisch', 'Vegetarisch', 'Salat', 'Eintopf'
];

const IMPORT_CATEGORIES = [
  'Pasta', 'Suppe', 'Curry', 'Reis', 'Salat',
  'Fleisch', 'Fisch', 'Vegetarisch', 'Dessert', 'Sonstiges'
];

// Shopping categories (in display order)
const SHOP_CATEGORIES = [
  'Gemüse & Obst',
  'Trockensortiment',
  'Tiefkühl',
  'Mopro',
  'Fleisch & Fisch',
  'Vorrat',
  'Sonstiges',
];

const SHOP_CAT_ICONS = {
  'Gemüse & Obst':   '🥦',
  'Trockensortiment':'🌾',
  'Tiefkühl':        '❄️',
  'Mopro':           '🧀',
  'Fleisch & Fisch': '🥩',
  'Vorrat':          '🫙',
  'Sonstiges':       '🛍️',
};

// Ingredient auto-classification dictionary
// Keys = shop category, values = substrings to match (case-insensitive)
const INGREDIENT_DICTIONARY = {
  'Gemüse & Obst': [
    'möhr', 'karott', 'zwiebel', 'schalotte', 'knoblauch', 'tomate', 'paprika',
    'zucchini', 'aubergine', 'spinat', 'brokkoli', 'blumenkohl', 'rosenkohl',
    'lauch', 'porree', 'sellerie', 'gurke', 'salat', 'kohl', 'fenchel',
    'erbsen', 'bohnen', 'mais', 'pilz', 'champignon', 'steinpilz',
    'apfel', 'birne', 'banane', 'zitrone', 'limette', 'orange', 'beere',
    'erdbeere', 'himbeere', 'blaubeere', 'mango', 'ananas', 'granatapfel',
    'petersilie', 'basilikum', 'schnittlauch', 'koriander', 'dill', 'minze',
    'rucola', 'mangold', 'artischocke', 'avocado', 'süßkartoffel', 'kürbis',
    'rote bete', 'radieschen', 'frühlingszwiebel', 'pak choi', 'ingwer frisch',
    'ingwer', 'chili frisch', 'chili', 'jalapeño', 'spargel', 'rettich'
  ],
  'Trockensortiment': [
    'spaghetti', 'penne', 'linguine', 'tagliatelle', 'fettuccine', 'rigatoni',
    'fusilli', 'farfalle', 'gnocchi', 'lasagneplatten', 'nudel', 'pasta',
    'reis', 'quinoa', 'couscous', 'bulgur', 'polenta', 'grieß',
    'linsen', 'kichererbsen', 'bohnen dose', 'tomaten dose', 'mais dose',
    'konserve', 'dose tomaten', 'passierte tomaten', 'brühe', 'suppenwürfel',
    'kokosmilch', 'mehl', 'zucker', 'puderzucker', 'stärke', 'hefe',
    'nüsse', 'mandeln', 'walnuss', 'cashew', 'erdnuss', 'pinienkerne',
    'paniermehl', 'semmelbrösel', 'haferflocken', 'müsli',
    'schokolade', 'kakao', 'honig', 'ahornsirup', 'marmelade',
    'tomatenmark', 'soßenpulver', 'sojasoße', 'soja-soße', 'soja', 'fischsoße', 'sriracha',
    'worcestershiresoße', 'tamarinde', 'miso',
    'kapern', 'oliven', 'artischockenherzen', 'passata', 'pizzatomaten',
    'gemüsebrühe', 'hühnerbrühe', 'rinderbrühe', 'instantbrühe'
  ],
  'Tiefkühl': [
    'tiefkühl', 'tk-', ' tk ', 'gefroren', 'tiefgekühl',
    'erbsen tk', 'spinat tk', 'fischstäbchen', 'pommes'
  ],
  'Mopro': [
    'milch', 'vollmilch', 'laktosefrei', 'hafermilch', 'mandelmilch', 'sojamilch',
    'sahne', 'schlagsahne', 'crème fraîche', 'schmand', 'sauerrahm',
    'butter', 'margarine',
    'käse', 'parmesan', 'mozzarella', 'gouda', 'emmentaler', 'cheddar',
    'feta', 'ricotta', 'mascarpone', 'frischkäse', 'quark', 'hüttenkäse',
    'joghurt', 'skyr', 'kefir',
    'ei', 'eier', 'hühnerei',
    'crème', 'schmelzkäse'
  ],
  'Fleisch & Fisch': [
    'hähnchen', 'hühnchen', 'hühnerbrust', 'hähnchenbrust', 'hähnchenkeule',
    'pute', 'putenbrust', 'ente', 'gans',
    'rind', 'rindfleisch', 'rinderhack', 'rumpsteak', 'rinderbraten',
    'schwein', 'schweinefleisch', 'schweinefilet', 'schweinerücken',
    'lamm', 'lammkeule', 'lammhack',
    'speck', 'bacon', 'schinken', 'prosciutto', 'pancetta', 'salami',
    'wurst', 'bratwurst', 'chorizo', 'hackfleisch', 'steak', 'schnitzel',
    'lachs', 'thunfisch', 'dorsch', 'kabeljau', 'heilbutt', 'tilapia',
    'dorade', 'makrele', 'sardellen', 'sardine', 'hering',
    'garnelen', 'crevetten', 'krabben', 'muscheln', 'tintenfisch', 'meeresfrüchte',
    'fisch', 'forelle', 'zander', 'hecht'
  ],
  'Vorrat': [
    'salz', 'meersalz', 'himalayasalz',
    'pfeffer', 'schwarzer pfeffer', 'weißer pfeffer',
    'olivenöl', 'sonnenblumenöl', 'rapsöl', 'kokosöl', 'sesamöl',
    'essig', 'weinessig', 'balsamico', 'apfelessig',
    'senf', 'dijonsenf',
    'kümmel', 'kreuzkümmel', 'kurkuma', 'paprikapulver', 'curry',
    'zimt', 'muskat', 'muskatnuss', 'oregano', 'thymian', 'rosmarin',
    'lorbeer', 'lorbeerblatt', 'chiliflocken', 'chilipulver', 'cayennepfeffer',
    'knoblauchpulver', 'zwiebelpulver', 'ingwerpulver', 'kardamom',
    'korianderpulver', 'nelken', 'piment', 'vanille', 'vanillezucker',
    'backpulver', 'natron', 'speisestärke', 'gelatine', 'agar',
    'zucker braun', 'rohrzucker', 'stevia',
    'prise', 'gewürzmischung', 'gewürz', 'gewürzpaste'
  ],
};


// ============================================================
// SECTION 2: STATE
// ============================================================

const State = {
  recipes:          [],     // Recipe[]
  wochenliste:      [],     // string[] — recipe IDs

  // Ephemeral UI state
  activeTab:        'rezepte',
  searchQuery:      '',
  activeRecipeTab:  'Alle',
  sidebarOpen:      true,
  panelOpen:        true,
  checkedItems:     new Set(),  // keys of checked shopping items
  editingRecipeId:  null,       // null = new recipe
  importPreview:    [],         // parsed recipes not yet committed
  importCategory:   '',         // selected category for import
  urlImportData:    null,       // fetched recipe from URL (single)
  urlImportLoading: false,
};


// ============================================================
// SECTION 3: STORAGE
// ============================================================

const Storage = {
  load() {
    try {
      State.recipes = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECIPES) || '[]');
      const raw     = JSON.parse(localStorage.getItem(STORAGE_KEYS.WOCHENLISTE) || '[]');
      // Migrate old format (string[]) → new format ({id, portions}[])
      State.wochenliste = raw.map(e => typeof e === 'string' ? { id: e, portions: 2 } : e);
    } catch (e) {
      console.error('localStorage load error:', e);
      State.recipes     = [];
      State.wochenliste = [];
      Render.toast('Gespeicherte Daten konnten nicht geladen werden.', 'error');
    }
    // Seed baseline recipes if localStorage is empty
    if (State.recipes.length === 0 && typeof BASELINE_RECIPES !== 'undefined' && BASELINE_RECIPES.length > 0) {
      State.recipes = BASELINE_RECIPES.map(r => ({
        ...r,
        cookTime:  r.cookTime  || 40,
        portions:  r.portions  || 2,
        reference: r.reference || '',
      }));
      this.saveRecipes();
    }
  },

  saveRecipes() {
    try {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(State.recipes));
    } catch (e) {
      Render.toast('Speichern fehlgeschlagen (Speicher voll?)', 'error');
    }
  },

  saveWochenliste() {
    try {
      localStorage.setItem(STORAGE_KEYS.WOCHENLISTE, JSON.stringify(State.wochenliste));
    } catch (e) {
      Render.toast('Wochenliste konnte nicht gespeichert werden.', 'error');
    }
  },
};


// ============================================================
// SECTION 4: RECIPE STORE
// ============================================================

const RecipeStore = {
  getAll() { return State.recipes; },

  getById(id) { return State.recipes.find(r => r.id === id) || null; },

  getFiltered() {
    let list = [...State.recipes];

    if (State.searchQuery.trim()) {
      const q = State.searchQuery.toLowerCase();
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.categories.some(c => c.toLowerCase().includes(q)) ||
        (r.description || '').toLowerCase().includes(q) ||
        r.ingredients.some(i => i.name.toLowerCase().includes(q))
      );
    }

    if (State.activeRecipeTab && State.activeRecipeTab !== 'Alle') {
      const tabLc = State.activeRecipeTab.toLowerCase();
      list = list.filter(r =>
        r.categories.some(c => c.toLowerCase().includes(tabLc)) ||
        r.title.toLowerCase().includes(tabLc)
      );
    }

    return list;
  },

  save(recipe) {
    const idx = State.recipes.findIndex(r => r.id === recipe.id);
    if (idx === -1) {
      State.recipes.push(recipe);
    } else {
      State.recipes[idx] = recipe;
    }
    Storage.saveRecipes();
  },

  delete(id) {
    State.recipes = State.recipes.filter(r => r.id !== id);
    WochenlisteStore.remove(id);
    Storage.saveRecipes();
  },

  create(data) {
    return {
      id:          `r_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title:       (data.title || '').trim(),
      categories:  Array.isArray(data.categories) ? data.categories : [],
      description: (data.description || '').trim(),
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      cookTime:    Math.max(1, parseInt(data.cookTime) || 40),
      portions:    Math.max(1, parseInt(data.portions) || 2),
      reference:   (data.reference || '').trim(),
    };
  },
};


// ============================================================
// SECTION 5: WOCHENLISTE STORE
// ============================================================

const WochenlisteStore = {
  // Returns [{recipe, portions}] for all entries with a valid recipe
  getEntries() {
    return State.wochenliste
      .map(e => {
        const recipe = RecipeStore.getById(e.id);
        return recipe ? { recipe, portions: e.portions } : null;
      })
      .filter(Boolean);
  },

  getRecipes() {
    return this.getEntries().map(e => e.recipe);
  },

  add(recipeId, portions) {
    if (!State.wochenliste.find(e => e.id === recipeId)) {
      const recipe = RecipeStore.getById(recipeId);
      State.wochenliste.push({ id: recipeId, portions: portions || recipe?.portions || 2 });
      Storage.saveWochenliste();
    }
  },

  remove(recipeId) {
    State.wochenliste = State.wochenliste.filter(e => e.id !== recipeId);
    Storage.saveWochenliste();
  },

  isInList(recipeId) {
    return State.wochenliste.some(e => e.id === recipeId);
  },

  getPortions(recipeId) {
    return State.wochenliste.find(e => e.id === recipeId)?.portions || 2;
  },

  setPortions(recipeId, portions) {
    const entry = State.wochenliste.find(e => e.id === recipeId);
    if (entry) { entry.portions = Math.max(1, portions); Storage.saveWochenliste(); }
  },

  clear() {
    State.wochenliste = [];
    Storage.saveWochenliste();
  },
};


// ============================================================
// SECTION 6: INGREDIENT CLASSIFIER
// ============================================================

const Classifier = {
  // Uses longest-match: if multiple categories match, pick the one with the longest keyword.
  // This correctly classifies "Tomatenmark" (11-char match in Trockensortiment) over
  // "Tomate" (6-char match in Gemüse & Obst).
  classify(ingredientName) {
    const nameLc = ingredientName.toLowerCase();
    let bestCategory = 'Sonstiges';
    let bestLen      = 0;
    for (const [category, keywords] of Object.entries(INGREDIENT_DICTIONARY)) {
      for (const kw of keywords) {
        if (nameLc.includes(kw) && kw.length > bestLen) {
          bestCategory = category;
          bestLen      = kw.length;
        }
      }
    }
    return bestCategory;
  },
};


// ============================================================
// SECTION 7: DOCX PARSER
// ============================================================

const DocxParser = {
  // Full list of recognised units (long forms first so regex matches greedily)
  UNITS: [
    'Esslöffel', 'Teelöffel', 'Messerspitze', 'Msp\\.?',
    'Kilogramm', 'Gramm', 'Liter', 'Deziliter', 'Zentiliter', 'Milliliter',
    'Päckchen', 'Paket[e]?', 'Tüte[n]?',
    'kg', 'g', 'ml', 'cl', 'dl', 'l',
    'EL', 'TL', 'Essl\\.?', 'Teel\\.?',
    'Prise[n]?', 'Bund', 'Bündel',
    'Dose[n]?', 'Glas', 'Gläser',
    'Pck\\.?', 'Pckg\\.?', 'Pkg\\.?', 'Packung(?:en)?',
    'Stück', 'Stk\\.?',
    'Scheibe[n]?', 'Zehe[n]?',
    'Tube[n]?', 'Flasche[n]?',
    'Handvoll', 'Schuss', 'Spritzer',
    'Zweig[e]?', 'Blatt', 'Blätter',
    'Tasse[n]?', 'Becher',
    'cm',
  ],

  FRACTION_MAP: { '¼': '0.25', '½': '0.5', '¾': '0.75', '⅓': '0.333', '⅔': '0.667' },

  SENTENCE_VERBS: /\b(kochen|braten|schneiden|vermischen|geben|dazugeben|hinzugeben|erhitzen|würzen|servieren|lassen|abgießen|anbraten|dünsten|waschen|hacken|reiben|rühren|streuen|mahlen|salzen|pfeffern|mischen|vorheizen|auslegen|schmelzen|verteilen|beträufeln|zerkleinern|einrühren|aufkochen|abschmecken|beiseite|stellen|ziehen|quellen|einweichen|ablöschen|einkochen|köcheln|wenden|abtropfen|bereitstellen|dazugeben|zugeben)\b/i,

  // Entry point: reads file → mammoth → parseText
  async readAndParse(file, category) {
    if (!window.mammoth) {
      throw new Error('mammoth.js nicht geladen. Bitte Internetverbindung prüfen.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return DocxParser.parseText(result.value, category);
  },

  // State-machine parser: classifies each blank-line-separated block as
  // 'title' | 'ingredients' | 'description', then groups into recipes.
  parseText(rawText, category) {
    const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Split on any sequence of 2+ blank lines; each resulting chunk is one block
    const blocks = text.split(/\n{2,}/).map(b => b.trim()).filter(b => b.length >= 2);

    const recipes = [];
    let current = null;
    let state   = 'seeking'; // 'seeking' | 'ingredients' | 'description'

    const finishRecipe = () => {
      if (current && current.title) {
        recipes.push({
          title:       current.title,
          categories:  category ? [category] : [],
          ingredients: current.ingredients,
          description: current.descParts.join('\n\n'),
          cookTime:    40,
          portions:    2,
          reference:   '',
        });
      }
      current = null;
    };

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (!lines.length) continue;

      const type = DocxParser.classifyBlock(lines);

      if (state === 'seeking') {
        if (type === 'title') {
          current = { title: lines[0], ingredients: [], descParts: [] };
          state   = 'ingredients';
        }
        // Non-title blocks before first title are ignored

      } else if (state === 'ingredients') {
        if (type === 'title') {
          // New recipe starts — save current (no ingredients found) and begin fresh
          finishRecipe();
          current = { title: lines[0], ingredients: [], descParts: [] };
          state   = 'ingredients';
        } else if (type === 'ingredients') {
          // Accumulate — each blank-line-separated ingredient line is its own block,
          // so stay in 'ingredients' state and keep collecting
          current.ingredients.push(...DocxParser.parseIngredientSection(lines));
          // state stays 'ingredients'
        } else {
          // First genuine description block → done collecting ingredients
          current.descParts.push(block);
          state = 'description';
        }

      } else { // state === 'description'
        if (type === 'title') {
          finishRecipe();
          current = { title: lines[0], ingredients: [], descParts: [] };
          state   = 'ingredients';
        } else {
          current.descParts.push(block);
        }
      }
    }
    finishRecipe();

    return { recipes, errors: [] };
  },

  // Classify a block (array of trimmed non-empty lines) as 'title' | 'ingredients' | 'description'
  classifyBlock(lines) {
    // Single-line block: title if short, no cooking verbs, no end punctuation, not an ingredient
    if (lines.length === 1) {
      const t = lines[0];
      if (
        t.length < 120 &&
        !DocxParser.SENTENCE_VERBS.test(t) &&
        !/[.!?:]\s*$/.test(t) &&
        !DocxParser.isIngredientLine(t)
      ) return 'title';
    }

    // If majority of lines look like ingredients → ingredients block
    const ingCount = lines.filter(l => DocxParser.isIngredientLine(l)).length;
    if (ingCount >= Math.max(1, lines.length * 0.5)) return 'ingredients';

    return 'description';
  },

  // Parse all lines of the ingredient section
  parseIngredientSection(lines) {
    const ingredients = [];
    for (const line of lines) {
      if (!line) continue;
      const parts = DocxParser.splitLine(line);
      for (const part of parts) {
        const ing = DocxParser.parseIngredientLine(part.trim());
        if (ing) ingredients.push(ing);
      }
    }
    return ingredients;
  },

  // Split a line first by comma, then by "und" if appropriate
  splitLine(line) {
    const byComma = DocxParser.splitCommaIngredients(line);
    if (byComma.length > 1) return byComma;

    // "Salz und Pfeffer" → ["Salz", "Pfeffer"] — only for short lines without cooking verbs
    if (/ und /i.test(line) && line.split(/\s+/).length <= 6 && !DocxParser.SENTENCE_VERBS.test(line)) {
      const parts = line.split(/ und /i).map(p => p.trim()).filter(Boolean);
      if (parts.length === 2 && parts.every(p => p.length <= 35)) return parts;
    }
    return [line];
  },

  // Split "Salz, Pfeffer" → ["Salz", "Pfeffer"]
  // Keep "Tomaten, gehackt", "Paprika, rot und gelb", "1 Dose Tomaten, passiert" as one item
  splitCommaIngredients(line) {
    if (!line.includes(',')) return [line];

    const parts = line.split(',').map(p => p.trim()).filter(Boolean);

    if (parts.length === 2) {
      const second = parts[1];
      // Preparation adjective
      if (/^(gewürfelt|gehackt|frisch|geschnitten|gerieben|gepresst|grob|fein|klein|ganz|getrocknet|gefroren|aufgetaut|geschält|passiert|püriert|abgetropft|in Scheiben|in Würfel|in Stücke|entkernt|gekocht|roh)/i.test(second)) return [line];
      // Color / descriptor
      if (/^(rot|gelb|grün|orange|weiß|schwarz|lila|rosa|braun|bunt|hell|dunkel)\b/i.test(second)) return [line];
      // Alternative / substitute
      if (/^(ersatzweise|alternativ|oder|bzw\.?)\b/i.test(second)) return [line];
      // Very short lowercase continuation (e.g. "gehackt", "gewürfelt" caught above, but also "jung")
      if (second.split(/\s+/).length <= 2 && !/\d/.test(second) && !/^[A-ZÄÖÜ]/.test(second)) return [line];
    }

    // If all parts are short and have no cooking verbs → split into separate ingredients
    if (parts.every(p => p.length <= 50 && !DocxParser.SENTENCE_VERBS.test(p))) {
      return parts;
    }
    return [line];
  },

  // Quick heuristic: does a line look like an ingredient?
  isIngredientLine(line) {
    const t = line.trim();
    if (!t) return false;

    // Starts with digit or fraction char
    if (/^[\d¼½¾⅓⅔]/.test(t)) return true;

    // Starts with a word quantity
    if (/^(etwas|reichlich|nach bedarf|n\.b\.|einige|ca\.|je |eine? prise)/i.test(t)) return true;

    // Short line (≤ 5 words) with no sentence-ending punctuation and no cooking verbs
    const words = t.split(/\s+/).length;
    if (words <= 5 && !/[.!?]$/.test(t) && !DocxParser.SENTENCE_VERBS.test(t)) return true;

    // Comma-separated short items
    const cParts = t.split(',').map(s => s.trim());
    if (cParts.length >= 2 && cParts.every(s => s.length <= 40 && !/[.!?]$/.test(s))) {
      if (!DocxParser.SENTENCE_VERBS.test(t)) return true;
    }

    return false;
  },

  // Parse one ingredient string → { name, amount, shopCategory }
  parseIngredientLine(line) {
    const t = line.trim();
    if (!t || t.length < 2) return null;

    const unitRx = DocxParser.UNITS.join('|');
    let amount = '';
    let name   = t;

    // 1) Number + unit + name  e.g. "200 g Spaghetti", "1 Esslöffel Basilikum"
    const m1 = t.match(new RegExp(`^([\\d¼½¾⅓⅔.,\\/\\s]+)\\s*(${unitRx})\\.?\\s+(.+)$`, 'i'));
    if (m1) {
      amount = `${DocxParser._normNum(m1[1])} ${m1[2]}`.trim();
      name   = m1[3].trim();
    } else {
      // 2) Number only + name  e.g. "1 Blumenkohl", "3 Knoblauchzehen"
      const m2 = t.match(/^([\d¼½¾⅓⅔.,\/]+)\s+(.+)$/);
      if (m2) {
        amount = DocxParser._normNum(m2[1]);
        name   = m2[2].trim();
      } else {
        // 3) Word quantity  e.g. "reichlich Olivenöl", "etwas Salz"
        const m3 = t.match(/^(etwas|reichlich|nach bedarf|n\.b\.|einige|ca\.)\s+(.+)$/i);
        if (m3) {
          amount = m3[1];
          name   = m3[2].trim();
        }
        // 4) No quantity at all  e.g. "Lorbeerblatt", "Salz" — name = entire string
      }
    }

    if (!name || name.length < 2) name = t;

    return { name, amount, shopCategory: Classifier.classify(name) };
  },

  // Replace unicode fraction chars with decimals and trim
  _normNum(str) {
    let s = str.trim();
    for (const [ch, val] of Object.entries(DocxParser.FRACTION_MAP)) s = s.replace(ch, val);
    return s.trim();
  },
};


// ============================================================
// SECTION 8: SHOPPING LIST
// ============================================================

const ShoppingList = {
  // Returns { [category]: [{name, amount, shopCategory, recipeName}] }
  // Each recipe is scaled by its own portion count relative to its default portions.
  generate() {
    const entries = WochenlisteStore.getEntries();
    const allItems = [];

    for (const { recipe, portions } of entries) {
      const basePortions = recipe.portions || 2;
      const factor = basePortions > 0 ? portions / basePortions : 1;
      for (const ing of recipe.ingredients) {
        allItems.push({
          name:         ing.name,
          amount:       ShoppingList.scaleAmount(ing.amount, factor),
          shopCategory: ing.shopCategory,
          recipeName:   recipe.title,
        });
      }
    }

    // Merge same ingredient names across recipes
    const merged = ShoppingList.mergeItems(allItems);

    const grouped = {};
    for (const cat of SHOP_CATEGORIES) grouped[cat] = [];
    for (const item of merged) {
      const cat = SHOP_CATEGORIES.includes(item.shopCategory) ? item.shopCategory : 'Sonstiges';
      grouped[cat].push(item);
    }
    return grouped;
  },

  // Aggregate items with identical names: sum numeric amounts with same unit,
  // show breakdown in parens — e.g. "400 g (200 g + 200 g)"
  mergeItems(items) {
    const byName = new Map();
    for (const item of items) {
      const key = item.name.toLowerCase().trim();
      if (!byName.has(key)) byName.set(key, []);
      byName.get(key).push(item);
    }

    const result = [];
    for (const [, group] of byName) {
      if (group.length === 1) { result.push(group[0]); continue; }

      const parsed   = group.map(i => ShoppingList._parseNum(i.amount));
      const firstUnit = parsed[0]?.unit;
      const allSame  = parsed.every(p => p && p.unit === firstUnit);

      if (allSame && parsed[0]) {
        const total  = parsed.reduce((s, p) => s + p.num, 0);
        const unit   = firstUnit ? ' ' + firstUnit : '';
        const parts  = parsed.map(p => ShoppingList._fmtNum(p.num) + unit).join(' + ');
        result.push({
          name:         group[0].name,
          amount:       `${ShoppingList._fmtNum(total)}${unit} (${parts})`,
          shopCategory: group[0].shopCategory,
          recipeName:   group.map(i => i.recipeName).join(', '),
        });
      } else {
        result.push(...group);
      }
    }
    return result;
  },

  _parseNum(amountStr) {
    if (!amountStr) return null;
    const m = amountStr.match(/^([\d.,]+)\s*(.*)/);
    if (!m) return null;
    const num = parseFloat(m[1].replace(',', '.'));
    return isNaN(num) ? null : { num, unit: m[2].trim() };
  },

  _fmtNum(n) {
    return n % 1 === 0 ? String(Math.round(n)) : parseFloat(n.toFixed(2)).toString().replace('.', ',');
  },

  // Scale a textual amount by factor
  scaleAmount(amountStr, factor) {
    if (!amountStr || factor === 1) return amountStr || '';
    const match = amountStr.match(/^([\d.,]+)\s*(.*)/);
    if (!match) return amountStr;
    const num  = parseFloat(match[1].replace(',', '.'));
    const rest = match[2];
    if (isNaN(num)) return amountStr;
    const scaled = num * factor;
    const formatted = scaled % 1 === 0
      ? scaled.toFixed(0)
      : parseFloat(scaled.toFixed(2)).toString().replace('.', ',');
    return rest ? `${formatted} ${rest}` : formatted;
  },

  // Unique key for checkbox state
  itemKey(item) {
    return `${item.recipeName}::${item.amount}::${item.name}`;
  },

  // Export as plain text
  toText(grouped) {
    const lines = ['Einkaufsliste', '=============', ''];

    for (const cat of SHOP_CATEGORIES) {
      const items = grouped[cat];
      if (!items || items.length === 0) continue;
      lines.push(`[ ${SHOP_CAT_ICONS[cat] || ''} ${cat} ]`);
      for (const item of items) {
        const prefix = item.amount ? `${item.amount} ` : '';
        lines.push(`  ☐ ${prefix}${item.name}`);
      }
      lines.push('');
    }
    return lines.join('\n');
  },

  // Export as Apple Reminders .ics (VCALENDAR/VTODO)
  toICS(grouped) {
    const now = new Date();
    const dtstamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Rezept-App//DE',
      'CALSCALE:GREGORIAN',
    ];

    let uid = 1;
    for (const cat of SHOP_CATEGORIES) {
      const items = grouped[cat];
      if (!items || items.length === 0) continue;
      for (const item of items) {
        const prefix  = item.amount ? `${item.amount} ` : '';
        const summary = `${prefix}${item.name}`;
        lines.push('BEGIN:VTODO');
        lines.push(`UID:einkauf-${now.getTime()}-${uid++}@rezept-app`);
        lines.push(`DTSTAMP:${dtstamp}`);
        lines.push(`SUMMARY:${ShoppingList.escapeICS(summary)}`);
        lines.push(`CATEGORIES:${ShoppingList.escapeICS(cat)}`);
        if (item.recipeName) lines.push(`DESCRIPTION:${ShoppingList.escapeICS(item.recipeName)}`);
        lines.push('STATUS:NEEDS-ACTION');
        lines.push('END:VTODO');
      }
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
  },

  escapeICS(str) {
    return (str || '').replace(/[,;\\]/g, c => '\\' + c).replace(/\n/g, '\\n');
  },

  // Export as AppleScript — opens in Script Editor, one click creates reminders
  toAppleScript(grouped) {
    const date     = new Date().toLocaleDateString('de-DE');
    const listName = `Einkaufsliste ${date}`;
    const esc      = s => (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    const lines = [
      'tell application "Reminders"',
      `\tset listName to "${listName}"`,
      '\tif not (exists list listName) then',
      '\t\tmake new list with properties {name:listName}',
      '\tend if',
      '\tset theList to list listName',
      '',
    ];

    for (const cat of SHOP_CATEGORIES) {
      const items = grouped[cat];
      if (!items || items.length === 0) continue;
      lines.push(`\t-- ${cat}`);
      for (const item of items) {
        const prefix = item.amount ? `${item.amount} ` : '';
        lines.push(`\tmake new reminder at theList with properties {name:"${esc(prefix + item.name)}"}`);
      }
      lines.push('');
    }

    lines.push('end tell');
    lines.push(`display dialog "✓ Einkaufsliste \\"${listName}\\" wurde in Erinnerungen erstellt!" buttons {"OK"} default button "OK"`);

    return lines.join('\n');
  },
};


// ============================================================
// SECTION 9: RENDER FUNCTIONS
// ============================================================

const Render = {
  // ── Toast Notifications ──────────────────────────────────
  toast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const el    = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${icons[type] || '•'}</span><span>${message}</span>`;
    container.appendChild(el);

    setTimeout(() => {
      el.classList.add('fade-out');
      setTimeout(() => el.remove(), 300);
    }, 3000);
  },

  // ── Recipe View ──────────────────────────────────────────
  recipeViewEl() {
    const el = document.createElement('div');
    el.className = 'p-6';

    const recipes = RecipeStore.getFiltered();
    const total   = RecipeStore.getAll().length;

    // Count recipes per tab
    const allRecipes = RecipeStore.getAll();
    const tabCounts = {};
    for (const tab of RECIPE_TABS) {
      if (tab === 'Alle') {
        tabCounts[tab] = allRecipes.length;
      } else {
        const tl = tab.toLowerCase();
        tabCounts[tab] = allRecipes.filter(r =>
          r.categories.some(c => c.toLowerCase().includes(tl)) ||
          r.title.toLowerCase().includes(tl)
        ).length;
      }
    }

    el.innerHTML = `
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-stone-800">Rezepte</h2>
          <p class="text-sm text-stone-500 mt-0.5">${total} Rezept${total !== 1 ? 'e' : ''} gespeichert</p>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="recipe-tab-bar">
        ${RECIPE_TABS.map(tab => {
          const active = State.activeRecipeTab === tab;
          const count  = tabCounts[tab];
          return `<button class="recipe-tab ${active ? 'active' : ''}"
                          data-action="select-recipe-tab" data-tab="${escHtml(tab)}">
            ${escHtml(tab)}${count > 0 ? `<span class="recipe-tab-count">${count}</span>` : ''}
          </button>`;
        }).join('')}
      </div>

      <!-- Search -->
      <div class="relative mb-5">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-base">🔍</span>
        <input id="search-input"
               type="text"
               placeholder="Rezepte suchen..."
               value="${escHtml(State.searchQuery)}"
               class="input-field pl-9">
      </div>

      <!-- Recipe Grid -->
      <div id="recipe-grid-container">
        ${Render.recipeGridHtml(recipes)}
      </div>
    `;
    return el;
  },

  recipeGridHtml(recipes) {
    if (recipes.length === 0) {
      const hasFilter = State.searchQuery || State.activeRecipeTab !== 'Alle';
      return `
        <div class="empty-state">
          <div class="icon">${hasFilter ? '🔎' : '🍳'}</div>
          <p>${hasFilter ? 'Kein Rezept gefunden.' : 'Noch keine Rezepte vorhanden.'}</p>
          <small>${State.searchQuery
            ? `<button data-action="clear-search" class="underline text-orange-500 mt-2">Suche zurücksetzen</button>`
            : State.activeRecipeTab !== 'Alle'
              ? `Noch keine Rezepte in dieser Kategorie.`
              : 'Klicke auf "+ Neues Rezept" um zu beginnen.'
          }</small>
        </div>
      `;
    }

    return `<div class="recipe-grid">
      ${recipes.map(r => Render.recipeCardHtml(r)).join('')}
    </div>`;
  },

  recipeCardHtml(recipe) {
    const inList    = WochenlisteStore.isInList(recipe.id);
    const catBadges = recipe.categories.slice(0, 2).map(c =>
      `<span class="category-tag">${escHtml(c)}</span>`
    ).join('');

    return `
      <article class="recipe-card ${inList ? 'in-list' : ''}"
               data-id="${recipe.id}">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold text-stone-800 text-sm line-clamp-2 flex-1 mr-2 leading-snug"
              data-action="view-recipe" data-id="${recipe.id}">
            ${escHtml(recipe.title)}
          </h3>
          <div class="flex gap-0.5 flex-shrink-0">
            <button class="btn-icon text-sm" data-action="edit-recipe" data-id="${recipe.id}" title="Bearbeiten">✏️</button>
            <button class="btn-icon text-sm" data-action="delete-recipe" data-id="${recipe.id}" title="Löschen">🗑️</button>
          </div>
        </div>

        ${catBadges ? `<div class="flex flex-wrap gap-1 mb-2">${catBadges}</div>` : ''}

        <div class="flex gap-3 text-xs text-stone-400 mb-3">
          ${recipe.cookTime ? `<span>⏱ ${recipe.cookTime} Min.</span>` : ''}
          <span>👤 ${recipe.portions || 2} Port.</span>
          <span>${recipe.ingredients.length} Zutaten</span>
        </div>

        <button class="btn-secondary w-full text-xs"
                data-action="${inList ? 'remove-from-woche' : 'add-to-woche'}"
                data-id="${recipe.id}">
          ${inList ? '✓ In der Wochenliste' : '+ Zur Wochenliste'}
        </button>
      </article>
    `;
  },

  // ── Wochenliste Panel (right sidebar) ────────────────────
  updateWochenlistePanel() {
    const container = document.getElementById('wochenliste-panel-content');
    if (!container) return;

    const entries = WochenlisteStore.getEntries();

    // Update sidebar badge + mobile nav badge
    const badge       = document.getElementById('nav-woche-count');
    const mobileBadge = document.getElementById('mobile-nav-badge');
    [badge, mobileBadge].forEach(b => {
      if (!b) return;
      b.textContent = entries.length;
      b.classList.toggle('hidden', entries.length === 0);
    });

    if (entries.length === 0) {
      container.innerHTML = `
        <div class="empty-state py-8">
          <div class="icon text-2xl">📅</div>
          <p class="text-xs">Noch keine Rezepte</p>
          <small>Klicke "+ Zur Wochenliste" auf einem Rezept</small>
        </div>`;
      return;
    }

    container.innerHTML = entries.map(({ recipe: r, portions }) => `
      <div class="woche-panel-item" data-id="${r.id}">
        <button class="btn-icon text-xs text-red-300 hover:text-red-500 flex-shrink-0"
                data-action="remove-from-woche" data-id="${r.id}" title="Entfernen">✕</button>
        <span class="woche-item-title cursor-pointer" data-action="view-recipe" data-id="${r.id}">
          ${escHtml(r.title)}
        </span>
        <span class="text-xs text-stone-400 flex-shrink-0">${portions}P</span>
      </div>
    `).join('');
  },

  // ── Wochenliste Main View ─────────────────────────────────
  wochenlisteViewEl() {
    const el      = document.createElement('div');
    el.className  = 'p-6';
    const entries = WochenlisteStore.getEntries();

    if (entries.length === 0) {
      el.innerHTML = `
        <h2 class="text-xl font-bold text-stone-800 mb-6">Wochenliste</h2>
        <div class="empty-state">
          <div class="icon">📅</div>
          <p>Keine Rezepte in der Wochenliste.</p>
          <small>Gehe zu "Rezepte" und füge Rezepte zur Wochenliste hinzu.</small>
        </div>`;
      return el;
    }

    el.innerHTML = `
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-stone-800">Wochenliste</h2>
        <button data-action="clear-woche" class="btn-danger">Leeren</button>
      </div>
      <div class="space-y-3 max-w-2xl">
        ${entries.map(({ recipe: r, portions }) => `
          <div class="bg-white rounded-xl border border-stone-100 p-4 hover:shadow-sm transition-shadow" data-id="${r.id}">
            <div class="flex items-start gap-3">
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-stone-800 cursor-pointer hover:text-orange-600"
                    data-action="view-recipe" data-id="${r.id}">${escHtml(r.title)}</h3>
                <div class="flex gap-1.5 mt-1 flex-wrap">
                  ${r.categories.map(c => `<span class="category-tag text-xs">${escHtml(c)}</span>`).join('')}
                  ${r.cookTime ? `<span class="text-xs text-stone-400">⏱ ${r.cookTime} Min.</span>` : ''}
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="text-xs text-stone-500 hidden sm:block">Port.:</span>
                <div class="portion-stepper">
                  <button type="button" data-action="woche-portions-minus" data-id="${r.id}"
                          ${portions <= 1 ? 'disabled' : ''}>−</button>
                  <span class="portion-value">${portions}</span>
                  <button type="button" data-action="woche-portions-plus" data-id="${r.id}">+</button>
                </div>
                <button class="btn-icon text-red-300 hover:text-red-500 ml-1"
                        data-action="remove-from-woche" data-id="${r.id}" title="Entfernen">✕</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>`;
    return el;
  },

  // ── Einkaufsliste View ────────────────────────────────────
  einkaufslisteViewEl() {
    const el = document.createElement('div');
    el.className = 'p-6';

    const wocheRecipes = WochenlisteStore.getRecipes();
    if (wocheRecipes.length === 0) {
      el.innerHTML = `
        <h2 class="text-xl font-bold text-stone-800 mb-6">Einkaufsliste</h2>
        <div class="empty-state">
          <div class="icon">🛒</div>
          <p>Keine Rezepte in der Wochenliste.</p>
          <small>Füge zuerst Rezepte zur Wochenliste hinzu.</small>
        </div>`;
      return el;
    }

    const entries    = WochenlisteStore.getEntries();
    const grouped    = ShoppingList.generate();
    const totalItems = Object.values(grouped).reduce((s, arr) => s + arr.length, 0);
    const totalPort  = entries.reduce((s, e) => s + e.portions, 0);

    el.innerHTML = `
      <!-- Header -->
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-xl font-bold text-stone-800">Einkaufsliste</h2>
          <p class="text-sm text-stone-500 mt-0.5">${totalItems} Artikel · ${entries.length} Rezept${entries.length !== 1 ? 'e' : ''} · ${totalPort} Portionen</p>
        </div>
      </div>

      <!-- Export Buttons (no-print) -->
      <div class="flex flex-wrap gap-2 mb-6 no-print">
        <button data-action="copy-list" class="btn-primary flex items-center gap-2">
          📋 In Zwischenablage
        </button>
        <button data-action="export-ics" class="btn-secondary flex items-center gap-2">
          📱 Erinnerungen (iPhone)
        </button>
        <button data-action="export-applescript" class="btn-outline flex items-center gap-2">
          💻 Erinnerungen (macOS)
        </button>
        <button data-action="export-txt" class="btn-outline flex items-center gap-2">
          📄 Als Text
        </button>
        <button data-action="print-list" class="btn-outline flex items-center gap-2">
          🖨️ Drucken
        </button>
      </div>

      <!-- Shopping Categories -->
      <div id="shopping-list-body">
        ${SHOP_CATEGORIES.map(cat => {
          const items = grouped[cat];
          if (!items || items.length === 0) return '';
          return `
            <div class="shop-category-section">
              <div class="shop-category-header" data-action="toggle-category" data-cat="${escHtml(cat)}">
                <span>${SHOP_CAT_ICONS[cat] || '•'}</span>
                <span>${escHtml(cat)}</span>
                <span class="ml-auto text-stone-400 font-normal text-xs">${items.length}</span>
                <span class="text-stone-300 text-xs ml-1" data-toggle-icon>▾</span>
              </div>
              <div class="shop-category-body" data-cat-body="${escHtml(cat)}">
                ${items.map(item => {
                  const key     = ShoppingList.itemKey(item);
                  const checked = State.checkedItems.has(key);
                  const amount  = item.amount ? `<span class="font-medium text-stone-700 min-w-[4rem] inline-block">${escHtml(item.amount)}</span>` : '';
                  return `
                    <label class="shopping-item ${checked ? 'checked' : ''}" data-key="${escHtml(key)}">
                      <input type="checkbox" data-role="shopping-checkbox" data-key="${escHtml(key)}" ${checked ? 'checked' : ''}>
                      ${amount}
                      <span class="text-stone-700">${escHtml(item.name)}</span>
                      <span class="ml-auto text-xs text-stone-400 hidden sm:block">${escHtml(item.recipeName)}</span>
                    </label>`;
                }).join('')}
              </div>
            </div>`;
        }).join('')}
      </div>
    `;
    return el;
  },

  // ── Import View ───────────────────────────────────────────
  importViewEl() {
    const el = document.createElement('div');
    el.className = 'p-6 max-w-2xl';

    el.innerHTML = `
      <h2 class="text-xl font-bold text-stone-800 mb-1">Rezepte importieren</h2>
      <p class="text-sm text-stone-500 mb-6">Importiere Rezepte aus einer Word-Datei (.docx). Die Kategorie gilt für alle Rezepte in der Datei.</p>

      <!-- Step 1: Category -->
      <div class="bg-white rounded-xl border border-stone-100 p-5 mb-4">
        <h3 class="font-semibold text-stone-700 mb-3 flex items-center gap-2">
          <span class="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">1</span>
          Kategorie wählen
        </h3>
        <select id="import-category-select" class="input-field max-w-xs">
          <option value="">— Kategorie wählen —</option>
          ${IMPORT_CATEGORIES.map(c =>
            `<option value="${escHtml(c)}" ${State.importCategory === c ? 'selected' : ''}>${escHtml(c)}</option>`
          ).join('')}
        </select>
      </div>

      <!-- Step 2: File -->
      <div class="bg-white rounded-xl border border-stone-100 p-5 mb-4">
        <h3 class="font-semibold text-stone-700 mb-3 flex items-center gap-2">
          <span class="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">2</span>
          .docx-Datei wählen
        </h3>
        <div class="import-dropzone" id="import-dropzone">
          <div class="text-3xl mb-2">📂</div>
          <p class="text-stone-600 font-medium mb-1">Datei hier ablegen oder auswählen</p>
          <p class="text-stone-400 text-sm mb-4">.docx (Microsoft Word)</p>
          <label class="btn-primary cursor-pointer">
            Datei wählen
            <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                   id="import-file-input" class="hidden" data-role="file-input">
          </label>
        </div>
        <div id="import-file-name" class="mt-2 text-sm text-stone-500 hidden"></div>
        <div id="import-loading" class="hidden mt-3 flex items-center gap-2 text-stone-500 text-sm">
          <svg class="animate-spin h-4 w-4 text-orange-500" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Datei wird gelesen...
        </div>
      </div>

      <!-- Preview -->
      <div id="import-preview-container" class="${State.importPreview.length === 0 ? 'hidden' : ''}">
        <div class="bg-white rounded-xl border border-stone-100 p-5 mb-4">
          <h3 class="font-semibold text-stone-700 mb-3 flex items-center gap-2">
            <span class="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">3</span>
            Vorschau
          </h3>
          <div id="import-preview-list"></div>
          <div class="mt-4 pt-4 border-t border-stone-100">
            <button data-action="confirm-import" class="btn-primary">
              ${State.importPreview.length} Rezept${State.importPreview.length !== 1 ? 'e' : ''} importieren
            </button>
          </div>
        </div>
      </div>

      <!-- URL Import -->
      <div class="bg-white rounded-xl border border-stone-100 p-5 mb-4">
        <h3 class="font-semibold text-stone-700 mb-1 flex items-center gap-2">
          Von URL importieren
          <span class="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">Neu</span>
        </h3>
        <p class="text-sm text-stone-400 mb-3">Füge einen Link zu einem Online-Rezept ein (z.B. chefkoch.de, eatsmarter.de, …)</p>
        <div class="flex gap-2">
          <input id="url-import-input" type="url" placeholder="https://www.chefkoch.de/rezepte/…"
            class="input-field flex-1 min-w-0" autocomplete="off" spellcheck="false">
          <button data-action="import-from-url"
            class="btn-primary whitespace-nowrap flex items-center gap-1.5" id="url-import-btn">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            Laden
          </button>
        </div>
        <!-- URL loading spinner -->
        <div id="url-import-loading" class="hidden mt-3 flex items-center gap-2 text-stone-500 text-sm">
          <svg class="animate-spin h-4 w-4 text-orange-500" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Rezept wird geladen…
        </div>
        <!-- URL import preview -->
        <div id="url-import-preview" class="hidden mt-4 pt-4 border-t border-stone-100">
          <div id="url-import-preview-content"></div>
          <div class="flex gap-2 mt-4">
            <button data-action="confirm-url-import" class="btn-primary">Rezept übernehmen</button>
            <button data-action="discard-url-import"
              class="px-4 py-2 rounded-lg text-stone-500 hover:bg-stone-100 text-sm transition">Verwerfen</button>
          </div>
        </div>
      </div>

      <!-- Format Help -->
      <details class="mt-4">
        <summary class="text-sm text-stone-400 cursor-pointer hover:text-stone-600">Dateiformat-Hilfe anzeigen</summary>
        <div class="mt-3 bg-stone-50 rounded-lg p-4 text-sm text-stone-600 space-y-2">
          <p><strong>Struktur der .docx-Datei:</strong></p>
          <ul class="list-disc list-inside space-y-1 text-stone-500">
            <li>Jedes Rezept beginnt mit dem <strong>Titel</strong> (erste Zeile)</li>
            <li>Danach folgen <strong>Zutaten</strong> (eine pro Zeile, mit Menge, z.B. "400g Spaghetti")</li>
            <li>Mehrere Zutaten können auch kommagetrennt in einer Zeile stehen</li>
            <li>Zubereitungstext wird automatisch als <strong>Beschreibung</strong> erkannt</li>
            <li>Rezepte werden durch <strong>Leerzeilen</strong> getrennt</li>
          </ul>
          <p class="mt-2"><strong>Beispiel:</strong></p>
          <pre class="bg-white border border-stone-200 rounded p-3 text-xs overflow-x-auto">Pasta Carbonara

400g Spaghetti, 150g Speck, 4 Eier, 80g Parmesan

Nudeln kochen. Speck anbraten. Eier und Parmesan
mischen und unter die heißen Nudeln rühren.


Penne Arrabbiata

400g Penne, Tomaten, 3 Zehen Knoblauch, Chili

Knoblauch in Olivenöl anbraten...</pre>
        </div>
      </details>
    `;
    return el;
  },

  // ── Recipe Detail Modal ───────────────────────────────────
  recipeDetailModalEl(recipe) {
    const el = document.createElement('div');
    el.className = 'p-6';
    const inList = WochenlisteStore.isInList(recipe.id);

    // Group ingredients by shop category
    const grouped = {};
    for (const ing of recipe.ingredients) {
      const cat = ing.shopCategory || 'Sonstiges';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(ing);
    }

    el.innerHTML = `
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1 mr-4">
          <div class="flex flex-wrap gap-1.5 mb-2">
            ${recipe.categories.map(c => `<span class="category-tag">${escHtml(c)}</span>`).join('')}
          </div>
          <h2 class="text-xl font-bold text-stone-800 leading-snug mb-2">${escHtml(recipe.title)}</h2>
          <div class="flex flex-wrap gap-3 text-sm text-stone-500">
            ${recipe.cookTime ? `<span>⏱ ${recipe.cookTime} Min.</span>` : ''}
            <span>👤 ${recipe.portions || 2} Portionen</span>
            ${recipe.reference ? `<span>📖 ${escHtml(recipe.reference)}</span>` : ''}
          </div>
        </div>
        <button class="btn-icon text-xl" data-action="close-modal" title="Schließen">✕</button>
      </div>

      <!-- Ingredients -->
      <div class="mb-5">
        <h3 class="font-semibold text-stone-700 mb-3 text-sm uppercase tracking-wide">Zutaten (${recipe.ingredients.length})</h3>
        ${SHOP_CATEGORIES.map(cat => {
          const items = grouped[cat];
          if (!items || items.length === 0) return '';
          return `
            <div class="mb-3">
              <p class="text-xs text-stone-400 font-medium mb-1.5 flex items-center gap-1">
                ${SHOP_CAT_ICONS[cat]} ${escHtml(cat)}
              </p>
              <div class="space-y-1 pl-4">
                ${items.map(i => `
                  <div class="flex items-baseline gap-2 text-sm">
                    ${i.amount ? `<span class="text-stone-500 min-w-[4rem] text-right flex-shrink-0">${escHtml(i.amount)}</span>` : '<span class="min-w-[4rem]"></span>'}
                    <span class="text-stone-700">${escHtml(i.name)}</span>
                  </div>`).join('')}
              </div>
            </div>`;
        }).join('')}
      </div>

      <!-- Description -->
      ${recipe.description ? `
        <div class="mb-5">
          <h3 class="font-semibold text-stone-700 mb-2 text-sm uppercase tracking-wide">Zubereitung</h3>
          <p class="text-stone-600 text-sm leading-relaxed whitespace-pre-line">${escHtml(recipe.description)}</p>
        </div>` : ''}

      <!-- Actions -->
      <div class="flex flex-wrap gap-2 pt-4 border-t border-stone-100">
        <button data-action="${inList ? 'remove-from-woche' : 'add-to-woche'}"
                data-id="${recipe.id}"
                class="${inList ? 'btn-outline' : 'btn-secondary'}">
          ${inList ? '✓ Aus Wochenliste entfernen' : '+ Zur Wochenliste'}
        </button>
        <button data-action="edit-recipe" data-id="${recipe.id}" class="btn-outline">
          ✏️ Bearbeiten
        </button>
        <button data-action="close-modal" class="btn-outline ml-auto">Schließen</button>
      </div>
    `;
    return el;
  },

  // ── Recipe Form Modal ─────────────────────────────────────
  recipeFormModalEl(recipe = null) {
    const isEdit = !!recipe;
    const r = recipe || { title: '', categories: [], description: '', ingredients: [], cookTime: 40, portions: 2, reference: '' };

    const el = document.createElement('div');
    el.className = 'p-6';

    // Pre-build ingredient rows HTML
    const ingRows = r.ingredients.length > 0
      ? r.ingredients.map(i => Render.ingredientRowHtml(i)).join('')
      : Render.ingredientRowHtml();

    el.innerHTML = `
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-xl font-bold text-stone-800">${isEdit ? 'Rezept bearbeiten' : 'Neues Rezept'}</h2>
        <button class="btn-icon text-xl" data-action="close-modal">✕</button>
      </div>

      <form id="recipe-form" class="space-y-5" novalidate>

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">Titel *</label>
          <input type="text" id="recipe-title" class="input-field"
                 placeholder="z.B. Pasta Carbonara"
                 value="${escHtml(r.title)}">
        </div>

        <!-- Categories -->
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">Kategorien</label>
          <div class="tag-input-container" id="tag-input-container">
            ${r.categories.map(c => Render.tagPillHtml(c)).join('')}
            <input type="text" id="tag-text-input" placeholder="Kategorie tippen + Enter…">
          </div>
          <input type="hidden" id="recipe-categories" value="${escHtml(JSON.stringify(r.categories))}">
        </div>

        <!-- Ingredients -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-medium text-stone-700">Zutaten *</label>
            <span class="text-xs text-stone-400">Menge · Name · Kategorie</span>
          </div>
          <div id="ingredient-list" class="space-y-1.5 mb-2">
            ${ingRows}
          </div>
          <button type="button" data-action="add-ingredient"
                  class="btn-outline text-xs flex items-center gap-1">
            + Zutat hinzufügen
          </button>
        </div>

        <!-- Cook time + Portions -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1.5">Kochzeit (Min.)</label>
            <input type="number" id="recipe-cooktime" class="input-field"
                   placeholder="40" value="${r.cookTime || 40}" min="1" max="480">
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1.5">Portionen</label>
            <input type="number" id="recipe-portions" class="input-field"
                   placeholder="2" value="${r.portions || 2}" min="1" max="20">
          </div>
        </div>

        <!-- Reference -->
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">Referenz</label>
          <input type="text" id="recipe-reference" class="input-field"
                 placeholder="Bestand · Kochbuch · URL"
                 value="${escHtml(r.reference || '')}">
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">Zubereitung</label>
          <textarea id="recipe-description" class="input-field" rows="5"
                    placeholder="Schritt-für-Schritt Anleitung...">${escHtml(r.description)}</textarea>
        </div>

        <!-- Submit -->
        <div class="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <button type="button" data-action="close-modal" class="btn-outline">Abbrechen</button>
          <button type="button" data-action="save-recipe" class="btn-primary">
            ${isEdit ? 'Änderungen speichern' : 'Rezept erstellen'}
          </button>
        </div>
      </form>
    `;
    return el;
  },

  ingredientRowHtml(ing = null) {
    const cats = SHOP_CATEGORIES.map(c =>
      `<option value="${escHtml(c)}" ${ing && ing.shopCategory === c ? 'selected' : ''}>${escHtml(c)}</option>`
    ).join('');

    return `
      <div class="ingredient-row" data-role="ingredient-row">
        <input type="text" class="input-field ing-amount" data-role="ing-amount"
               placeholder="Menge" value="${ing ? escHtml(ing.amount) : ''}">
        <input type="text" class="input-field ing-name" data-role="ing-name"
               placeholder="Zutat *" value="${ing ? escHtml(ing.name) : ''}">
        <select class="input-field ing-cat" data-role="ing-category">${cats}</select>
        <button type="button" class="btn-icon text-red-300 hover:text-red-500"
                data-action="remove-ingredient">✕</button>
      </div>`;
  },

  tagPillHtml(category) {
    return `<span class="tag-pill" data-tag="${escHtml(category)}">
      ${escHtml(category)}
      <button type="button" data-action="remove-tag" data-tag="${escHtml(category)}">×</button>
    </span>`;
  },
};


// ============================================================
// SECTION 10: MODAL SYSTEM
// ============================================================

const Modal = {
  open(contentEl) {
    const overlay = document.getElementById('modal-overlay');
    const box     = document.getElementById('modal-box');
    box.innerHTML = '';
    box.appendChild(contentEl);
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  close() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('hidden');
    document.getElementById('modal-box').innerHTML = '';
    document.body.style.overflow = '';
    State.editingRecipeId = null;
  },

  openForm(recipe) {
    State.editingRecipeId = recipe ? recipe.id : null;
    Modal.open(Render.recipeFormModalEl(recipe));
  },

  openDetail(recipe) {
    Modal.open(Render.recipeDetailModalEl(recipe));
  },

  openPortionsPicker(recipe) {
    const def = recipe.portions || 2;
    const el  = document.createElement('div');
    el.className = 'p-6';
    el.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-stone-800">Zur Wochenliste</h2>
        <button class="btn-icon text-xl" data-action="close-modal">✕</button>
      </div>
      <p class="font-medium text-stone-700 mb-1">${escHtml(recipe.title)}</p>
      <p class="text-sm text-stone-400 mb-5">Für wie viele Portionen?</p>
      <div class="flex items-center gap-4 mb-6">
        <span class="text-sm text-stone-500 font-medium">Portionen:</span>
        <div class="portion-stepper">
          <button type="button" data-action="picker-minus" ${def <= 1 ? 'disabled' : ''}>−</button>
          <span class="portion-value" id="picker-value">${def}</span>
          <button type="button" data-action="picker-plus">+</button>
        </div>
      </div>
      <div class="flex gap-2">
        <button type="button" data-action="close-modal" class="btn-outline">Abbrechen</button>
        <button type="button" data-action="confirm-add-to-woche"
                data-id="${recipe.id}" data-portions="${def}"
                class="btn-primary flex-1">Hinzufügen</button>
      </div>
    `;
    Modal.open(el);
  },
};


// ============================================================
// SECTION 11: ROUTER
// ============================================================

const Router = {
  navigate(tab) {
    State.activeTab = tab;

    // Update sidebar + bottom nav active state
    document.querySelectorAll('[data-tab]').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === tab);
    });

    Router.refresh();
  },

  refresh() {
    const content = document.getElementById('main-content');
    if (!content) return;

    switch (State.activeTab) {
      case 'rezepte':
        content.innerHTML = '';
        content.appendChild(Render.recipeViewEl());
        // Re-focus search if there was a query
        if (State.searchQuery) {
          const input = document.getElementById('search-input');
          if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
        }
        break;
      case 'wochenliste':
        content.innerHTML = '';
        content.appendChild(Render.wochenlisteViewEl());
        break;
      case 'einkaufsliste':
        content.innerHTML = '';
        content.appendChild(Render.einkaufslisteViewEl());
        break;
      case 'importieren':
        content.innerHTML = '';
        content.appendChild(Render.importViewEl());
        break;
    }

    Render.updateWochenlistePanel();
  },

  // Partial re-render of just the recipe grid (used during search input)
  refreshRecipeGrid() {
    const container = document.getElementById('recipe-grid-container');
    if (!container) return;
    container.innerHTML = Render.recipeGridHtml(RecipeStore.getFiltered());
  },
};


// ============================================================
// SECTION 12: EVENT HANDLERS
// ============================================================

const Handlers = {
  setup() {
    // --- Sidebar (desktop) ---
    const sidebar = document.getElementById('sidebar');
    sidebar.addEventListener('click', Handlers.onSidebarClick);
    sidebar.addEventListener('change', (e) => {
      if (e.target.dataset.role === 'backup-import') {
        const file = e.target.files[0];
        if (file) { Handlers.backupImport(file); e.target.value = ''; }
      }
    });

    // --- Sidebar/panel expand tabs ---
    document.getElementById('sidebar-expand-tab')?.addEventListener('click', Handlers.toggleSidebar);
    document.getElementById('panel-expand-tab')?.addEventListener('click', Handlers.togglePanel);

    // --- Mobile header ---
    document.getElementById('mobile-header')?.addEventListener('click', e => {
      const action = e.target.closest('[data-action]');
      if (action?.dataset.action === 'new-recipe') Modal.openForm(null);
    });

    // --- Mobile bottom nav ---
    document.getElementById('mobile-nav')?.addEventListener('click', e => {
      const btn = e.target.closest('[data-tab]');
      if (btn) Router.navigate(btn.dataset.tab);
    });

    // --- Main content (event delegation) ---
    const main = document.getElementById('main-content');
    main.addEventListener('click',  Handlers.onMainClick);
    main.addEventListener('input',  Handlers.onMainInput);
    main.addEventListener('change', Handlers.onMainChange);
    main.addEventListener('keydown', Handlers.onMainKeydown);

    // --- Right panel ---
    document.getElementById('wochenliste-panel')
      .addEventListener('click', Handlers.onPanelClick);

    // --- Modal overlay (close on backdrop click) ---
    document.getElementById('modal-overlay')
      .addEventListener('click', e => {
        if (e.target === document.getElementById('modal-overlay')) Modal.close();
      });

    // --- Modal box (event delegation) ---
    document.getElementById('modal-overlay')
      .addEventListener('click', Handlers.onModalClick);
    document.getElementById('modal-overlay')
      .addEventListener('input',  Handlers.onModalInput);
    document.getElementById('modal-overlay')
      .addEventListener('keydown', Handlers.onModalKeydown);
    document.getElementById('modal-overlay')
      .addEventListener('change', Handlers.onModalChange);

    // --- Keyboard: Escape closes modal ---
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') Modal.close();
    });
  },

  // ── Sidebar ──────────────────────────────────────────────
  onSidebarClick(e) {
    const tab = e.target.closest('[data-tab]');
    if (tab) { Router.navigate(tab.dataset.tab); return; }

    const action = e.target.closest('[data-action]');
    if (!action) return;

    if (action.dataset.action === 'new-recipe')     Modal.openForm(null);
    if (action.dataset.action === 'backup-export')  Handlers.backupExport();
    if (action.dataset.action === 'toggle-sidebar') Handlers.toggleSidebar();
    if (action.dataset.action === 'toggle-panel')   Handlers.togglePanel();
  },

  // ── Right Panel ───────────────────────────────────────────
  onPanelClick(e) {
    const action = e.target.closest('[data-action]');
    if (!action) return;

    const id = action.dataset.id;
    switch (action.dataset.action) {
      case 'toggle-panel':
        Handlers.togglePanel();
        break;
      case 'remove-from-woche':
        WochenlisteStore.remove(id);
        Render.updateWochenlistePanel();
        Router.refreshRecipeGrid();
        if (State.activeTab === 'wochenliste') Router.refresh();
        break;
      case 'view-recipe': {
        const r = RecipeStore.getById(id);
        if (r) Modal.openDetail(r);
        break;
      }
      case 'go-to-einkauf':
        Router.navigate('einkaufsliste');
        break;
      case 'clear-woche':
        if (WochenlisteStore.getRecipes().length > 0) Handlers.clearWoche();
        break;
    }
  },

  // ── Main Content ──────────────────────────────────────────
  onMainClick(e) {
    const action = e.target.closest('[data-action]');
    if (!action) return;

    const id  = action.dataset.id;
    const act = action.dataset.action;

    switch (act) {
      case 'select-recipe-tab': {
        State.activeRecipeTab = action.dataset.tab || 'Alle';
        // Update tab active state without full re-render
        document.querySelectorAll('[data-action="select-recipe-tab"]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.tab === State.activeRecipeTab);
        });
        Router.refreshRecipeGrid();
        break;
      }
      case 'clear-search':
        State.searchQuery = '';
        Router.refreshRecipeGrid();
        break;
      case 'view-recipe': {
        const r = RecipeStore.getById(id);
        if (r) Modal.openDetail(r);
        break;
      }
      case 'edit-recipe': {
        const r = RecipeStore.getById(id);
        if (r) Modal.openForm(r);
        break;
      }
      case 'delete-recipe':
        Handlers.deleteRecipe(id);
        break;
      case 'add-to-woche': {
        const r = RecipeStore.getById(id);
        if (r) Modal.openPortionsPicker(r);
        break;
      }
      case 'remove-from-woche':
        WochenlisteStore.remove(id);
        Render.updateWochenlistePanel();
        Router.refreshRecipeGrid();
        if (State.activeTab === 'wochenliste') Router.refresh();
        Render.toast('Aus Wochenliste entfernt.', 'info');
        break;
      case 'go-to-einkauf':
        Router.navigate('einkaufsliste');
        break;
      case 'clear-woche':
        Handlers.clearWoche();
        break;
      case 'woche-portions-minus': {
        const cur = WochenlisteStore.getPortions(id);
        if (cur > 1) {
          WochenlisteStore.setPortions(id, cur - 1);
          const row = document.querySelector(`.space-y-3 [data-id="${id}"]`);
          if (row) {
            row.querySelector('.portion-value').textContent = cur - 1;
            row.querySelector('[data-action="woche-portions-minus"]').disabled = (cur - 1) <= 1;
          }
        }
        break;
      }
      case 'woche-portions-plus': {
        const cur = WochenlisteStore.getPortions(id);
        WochenlisteStore.setPortions(id, cur + 1);
        const row = document.querySelector(`.space-y-3 [data-id="${id}"]`);
        if (row) {
          row.querySelector('.portion-value').textContent = cur + 1;
          row.querySelector('[data-action="woche-portions-minus"]').disabled = false;
        }
        break;
      }
      case 'toggle-category': {
        const cat  = action.dataset.cat;
        const body = [...document.querySelectorAll('[data-cat-body]')].find(el => el.dataset.catBody === cat);
        const icon = action.querySelector('[data-toggle-icon]');
        if (body) {
          const hidden = body.style.display === 'none';
          body.style.display = hidden ? '' : 'none';
          if (icon) icon.textContent = hidden ? '▾' : '▸';
        }
        break;
      }
      case 'copy-list':
        Handlers.copyList();
        break;
      case 'export-ics':
        Handlers.exportICS();
        break;
      case 'export-applescript':
        Handlers.exportAppleScript();
        break;
      case 'export-txt':
        Handlers.exportTxt();
        break;
      case 'print-list':
        Handlers.printList();
        break;
      case 'confirm-import':
        Handlers.confirmImport();
        break;
      case 'import-from-url':
        Handlers.importFromUrl();
        break;
      case 'confirm-url-import':
        Handlers.confirmUrlImport();
        break;
      case 'discard-url-import':
        State.urlImportData = null;
        document.getElementById('url-import-preview')?.classList.add('hidden');
        document.getElementById('url-import-input').value = '';
        break;
    }
  },

  onMainInput(e) {
    if (e.target.id === 'search-input') {
      State.searchQuery = e.target.value;
      Router.refreshRecipeGrid();
    }
  },

  onMainChange(e) {
    if (e.target.dataset.role === 'file-input') {
      const file = e.target.files[0];
      const cat  = document.getElementById('import-category-select')?.value || '';
      if (file && !cat) {
        Render.toast('Bitte zuerst eine Kategorie wählen.', 'error');
        e.target.value = '';
        return;
      }
      if (file) Handlers.onFileSelected(file, cat);
    }
    if (e.target.id === 'import-category-select') {
      State.importCategory = e.target.value;
    }
    if (e.target.dataset.role === 'shopping-checkbox') {
      Handlers.onCheckboxToggle(e.target);
    }
  },

  onMainKeydown(e) {
    // Nothing special here currently
  },

  // ── Modal ─────────────────────────────────────────────────
  onModalClick(e) {
    // Click on tag-input-container (not on a pill/button) → focus text input
    if (e.target.closest('#tag-input-container') && !e.target.closest('[data-action]')) {
      document.getElementById('tag-text-input')?.focus();
    }

    const action = e.target.closest('[data-action]');
    if (!action) return;

    const act = action.dataset.action;
    const id  = action.dataset.id;

    switch (act) {
      case 'close-modal':
        Modal.close();
        break;
      case 'save-recipe':
        Handlers.saveRecipe();
        break;
      case 'add-ingredient': {
        const list = document.getElementById('ingredient-list');
        if (list) list.insertAdjacentHTML('beforeend', Render.ingredientRowHtml());
        break;
      }
      case 'remove-ingredient':
        action.closest('[data-role="ingredient-row"]')?.remove();
        break;
      case 'remove-tag': {
        const tag = action.dataset.tag;
        Handlers.removeTag(tag);
        break;
      }
      case 'add-to-woche': {
        const r = RecipeStore.getById(id);
        if (r) Modal.openPortionsPicker(r);
        break;
      }
      case 'confirm-add-to-woche': {
        const portions = parseInt(action.dataset.portions) || 2;
        WochenlisteStore.add(id, portions);
        Modal.close();
        Render.updateWochenlistePanel();
        Router.refreshRecipeGrid();
        Render.toast('Zur Wochenliste hinzugefügt.');
        break;
      }
      case 'picker-minus': {
        const valEl = document.getElementById('picker-value');
        const confirmBtn = document.querySelector('[data-action="confirm-add-to-woche"]');
        const val = Math.max(1, (parseInt(valEl?.textContent) || 2) - 1);
        if (valEl) valEl.textContent = val;
        if (confirmBtn) confirmBtn.dataset.portions = val;
        action.disabled = val <= 1;
        break;
      }
      case 'picker-plus': {
        const valEl = document.getElementById('picker-value');
        const confirmBtn = document.querySelector('[data-action="confirm-add-to-woche"]');
        const val = (parseInt(valEl?.textContent) || 2) + 1;
        if (valEl) valEl.textContent = val;
        if (confirmBtn) confirmBtn.dataset.portions = val;
        const minusBtn = document.querySelector('[data-action="picker-minus"]');
        if (minusBtn) minusBtn.disabled = false;
        break;
      }
      case 'remove-from-woche':
        WochenlisteStore.remove(id);
        Render.updateWochenlistePanel();
        Modal.close();
        Router.refresh();
        Render.toast('Aus Wochenliste entfernt.', 'info');
        break;
      case 'edit-recipe': {
        Modal.close();
        const r = RecipeStore.getById(id);
        if (r) Modal.openForm(r);
        break;
      }
    }
  },

  onModalInput(e) {
    if (e.target.id === 'tag-text-input') {
      // Live preview while typing — nothing to do
    }
  },

  onModalKeydown(e) {
    if (e.target.id === 'tag-text-input') {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = e.target.value.trim().replace(/,$/, '');
        if (val) Handlers.addTag(val);
        e.target.value = '';
      }
    }
  },

  onModalChange(e) {
    // nothing currently
  },

  // ── Tag management ────────────────────────────────────────
  addTag(tag) {
    const hiddenInput = document.getElementById('recipe-categories');
    const container   = document.getElementById('tag-input-container');
    if (!hiddenInput || !container) return;

    const tags = JSON.parse(hiddenInput.value || '[]');
    if (tags.includes(tag)) return; // no duplicates

    tags.push(tag);
    hiddenInput.value = JSON.stringify(tags);

    // Insert pill before the text input
    const textInput = document.getElementById('tag-text-input');
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.dataset.tag = tag;
    pill.innerHTML = `${escHtml(tag)}<button type="button" data-action="remove-tag" data-tag="${escHtml(tag)}">×</button>`;
    container.insertBefore(pill, textInput);
  },

  removeTag(tag) {
    const hiddenInput = document.getElementById('recipe-categories');
    const container   = document.getElementById('tag-input-container');
    if (!hiddenInput || !container) return;

    let tags = JSON.parse(hiddenInput.value || '[]');
    tags = tags.filter(t => t !== tag);
    hiddenInput.value = JSON.stringify(tags);

    [...container.querySelectorAll('.tag-pill')].find(el => el.dataset.tag === tag)?.remove();
  },

  // ── CRUD Actions ──────────────────────────────────────────
  deleteRecipe(id) {
    const recipe = RecipeStore.getById(id);
    if (!recipe) return;
    if (!confirm(`"${recipe.title}" wirklich löschen?`)) return;
    RecipeStore.delete(id);
    Router.refresh();
    Render.toast(`"${recipe.title}" gelöscht.`);
  },

  saveRecipe() {
    const form = document.getElementById('recipe-form');
    if (!form) return;

    const data = Handlers.collectFormData(form);
    const errors = Handlers.validateForm(data);
    if (errors.length) {
      Render.toast(errors.join(' | '), 'error');
      return;
    }

    let recipe;
    if (State.editingRecipeId) {
      const existing = RecipeStore.getById(State.editingRecipeId);
      recipe = { ...existing, ...data };
    } else {
      recipe = RecipeStore.create(data);
    }

    RecipeStore.save(recipe);
    Modal.close();
    Router.refresh();
    Render.toast(State.editingRecipeId ? 'Rezept gespeichert.' : 'Neues Rezept erstellt.');
  },

  collectFormData(form) {
    const rows = form.querySelectorAll('[data-role="ingredient-row"]');
    const ingredients = [...rows]
      .map(row => ({
        amount:       row.querySelector('[data-role="ing-amount"]')?.value.trim() || '',
        name:         row.querySelector('[data-role="ing-name"]')?.value.trim() || '',
        shopCategory: row.querySelector('[data-role="ing-category"]')?.value || 'Sonstiges',
      }))
      .filter(i => i.name.length > 0);

    const hiddenCats = form.querySelector('#recipe-categories');
    let categories = [];
    try { categories = JSON.parse(hiddenCats?.value || '[]'); } catch {}

    return {
      title:       form.querySelector('#recipe-title')?.value.trim() || '',
      categories,
      description: form.querySelector('#recipe-description')?.value.trim() || '',
      ingredients,
      cookTime:    Math.max(1, parseInt(form.querySelector('#recipe-cooktime')?.value) || 40),
      portions:    Math.max(1, parseInt(form.querySelector('#recipe-portions')?.value) || 2),
      reference:   form.querySelector('#recipe-reference')?.value.trim() || '',
    };
  },

  validateForm(data) {
    const errors = [];
    if (!data.title) errors.push('Titel fehlt.');
    if (data.ingredients.length === 0) errors.push('Mindestens eine Zutat erforderlich.');
    return errors;
  },

  clearWoche() {
    const count = WochenlisteStore.getRecipes().length;
    if (count === 0) return;
    if (!confirm(`Wochenliste wirklich leeren (${count} Rezept${count !== 1 ? 'e' : ''})?`)) return;
    WochenlisteStore.clear();
    Render.updateWochenlistePanel();
    if (State.activeTab === 'wochenliste' || State.activeTab === 'einkaufsliste') Router.refresh();
    else Router.refreshRecipeGrid();
    Render.toast('Wochenliste geleert.', 'info');
  },

  // ── Import ────────────────────────────────────────────────
  async onFileSelected(file, category) {
    const fileNameEl = document.getElementById('import-file-name');
    const loadingEl  = document.getElementById('import-loading');
    const previewContainer = document.getElementById('import-preview-container');

    if (fileNameEl) {
      fileNameEl.textContent = `📄 ${file.name}`;
      fileNameEl.classList.remove('hidden');
    }
    if (loadingEl) loadingEl.classList.remove('hidden');

    try {
      const { recipes, errors } = await DocxParser.readAndParse(file, category);
      State.importPreview = recipes;

      if (loadingEl) loadingEl.classList.add('hidden');

      Handlers.renderImportPreview(recipes, errors);
      if (previewContainer) previewContainer.classList.remove('hidden');

    } catch (err) {
      if (loadingEl) loadingEl.classList.add('hidden');
      Render.toast(`Fehler beim Lesen: ${err.message}`, 'error');
      console.error(err);
    }
  },

  renderImportPreview(recipes, errors) {
    const listEl = document.getElementById('import-preview-list');
    if (!listEl) return;

    const existing = State.recipes.map(r => r.title.toLowerCase());
    let html = '';

    if (recipes.length === 0) {
      html = `<p class="text-stone-500 text-sm">Keine Rezepte erkannt. Bitte Dateiformat prüfen.</p>`;
    } else {
      const dupes = recipes.filter(r => existing.includes(r.title.toLowerCase()));
      const news  = recipes.filter(r => !existing.includes(r.title.toLowerCase()));

      html += `<p class="text-sm text-stone-500 mb-3">${news.length} neu · ${dupes.length} bereits vorhanden (werden übersprungen)</p>`;

      html += '<div class="space-y-2">';
      for (const r of recipes) {
        const isDupe = existing.includes(r.title.toLowerCase());
        html += `
          <div class="flex items-center gap-3 text-sm ${isDupe ? 'opacity-50' : ''}">
            <span class="${isDupe ? 'text-stone-400' : 'text-green-600'}">${isDupe ? '⏭' : '✓'}</span>
            <span class="font-medium text-stone-700 flex-1">${escHtml(r.title)}</span>
            <span class="text-stone-400">${r.ingredients.length} Zutaten</span>
            ${isDupe ? '<span class="text-xs text-stone-400">vorhanden</span>' : ''}
          </div>`;
      }
      html += '</div>';
    }

    if (errors.length > 0) {
      html += `<div class="mt-3 text-xs text-red-500">${errors.slice(0, 5).map(e => `<div>⚠ ${escHtml(e)}</div>`).join('')}</div>`;
    }

    listEl.innerHTML = html;

    // Update confirm button text
    const confirmBtn = document.querySelector('[data-action="confirm-import"]');
    if (confirmBtn) {
      const newCount = recipes.filter(r => !existing.includes(r.title.toLowerCase())).length;
      confirmBtn.textContent = `${newCount} Rezept${newCount !== 1 ? 'e' : ''} importieren`;
      confirmBtn.disabled = newCount === 0;
    }
  },

  confirmImport() {
    const existing = State.recipes.map(r => r.title.toLowerCase());
    let added = 0;

    for (const data of State.importPreview) {
      if (!existing.includes(data.title.toLowerCase())) {
        RecipeStore.save(RecipeStore.create(data));
        added++;
      }
    }

    State.importPreview = [];
    Router.navigate('rezepte');
    Render.toast(`${added} Rezept${added !== 1 ? 'e' : ''} importiert.`);
  },

  // ── URL Import ────────────────────────────────────────────
  async importFromUrl() {
    const input = document.getElementById('url-import-input');
    const url   = input?.value?.trim();
    if (!url || !url.startsWith('http')) {
      Render.toast('Bitte eine gültige URL eingeben.', 'error');
      return;
    }

    const loadingEl = document.getElementById('url-import-loading');
    const previewEl = document.getElementById('url-import-preview');
    const btn       = document.getElementById('url-import-btn');

    loadingEl?.classList.remove('hidden');
    previewEl?.classList.add('hidden');
    if (btn) btn.disabled = true;

    try {
      const fnUrl = `/.netlify/functions/fetch-recipe?url=${encodeURIComponent(url)}`;
      const res   = await fetch(fnUrl);
      const json  = await res.json();

      if (!res.ok) {
        Render.toast(json.error || 'Fehler beim Laden des Rezepts.', 'error');
        return;
      }

      // Re-classify ingredients with our own dictionary
      json.ingredients = (json.ingredients || []).map(ing => ({
        ...ing,
        shopCategory: Classifier.classify(ing.name),
      }));

      State.urlImportData = json;
      Handlers.renderUrlPreview(json);
      previewEl?.classList.remove('hidden');
    } catch (e) {
      Render.toast(`Netzwerkfehler: ${e.message}`, 'error');
    } finally {
      loadingEl?.classList.add('hidden');
      if (btn) btn.disabled = false;
    }
  },

  renderUrlPreview(recipe) {
    const el = document.getElementById('url-import-preview-content');
    if (!el) return;

    const cats = (recipe.categories || []).length > 0
      ? recipe.categories.map(c => `<span class="tag">${escHtml(c)}</span>`).join('')
      : '<span class="text-stone-400 text-xs">Keine Kategorie erkannt</span>';

    el.innerHTML = `
      <div class="space-y-3">
        <div>
          <div class="text-xs text-stone-400 mb-0.5">Titel</div>
          <input id="url-preview-title" class="input-field w-full font-medium"
            value="${escHtml(recipe.title)}">
        </div>
        <div class="flex gap-4 text-sm text-stone-600">
          <span>⏱ ${recipe.cookTime || 40} Min.</span>
          <span>👤 ${recipe.portions || 2} Portionen</span>
          <span>${recipe.ingredients?.length || 0} Zutaten erkannt</span>
        </div>
        <div class="flex flex-wrap gap-1">${cats}</div>
        <details class="text-sm">
          <summary class="cursor-pointer text-stone-500 hover:text-stone-700">Zutaten anzeigen</summary>
          <ul class="mt-2 space-y-0.5 text-stone-600">
            ${(recipe.ingredients || []).map(i =>
              `<li class="flex gap-2"><span class="text-stone-400 w-20 shrink-0">${escHtml(i.amount)}</span><span>${escHtml(i.name)}</span></li>`
            ).join('')}
          </ul>
        </details>
      </div>
    `;
  },

  confirmUrlImport() {
    const data = State.urlImportData;
    if (!data) return;

    // Allow user to have edited the title input
    const titleInput = document.getElementById('url-preview-title');
    if (titleInput) data.title = titleInput.value.trim() || data.title;

    const existing = State.recipes.map(r => r.title.toLowerCase());
    if (existing.includes(data.title.toLowerCase())) {
      Render.toast('Ein Rezept mit diesem Titel existiert bereits.', 'error');
      return;
    }

    RecipeStore.save(RecipeStore.create(data));
    State.urlImportData = null;
    Router.navigate('rezepte');
    Render.toast(`"${data.title}" importiert.`);
  },

  // ── Panel Toggles ─────────────────────────────────────────
  toggleSidebar() {
    State.sidebarOpen = !State.sidebarOpen;
    const sidebar  = document.getElementById('sidebar');
    const expTab   = document.getElementById('sidebar-expand-tab');
    sidebar.classList.toggle('collapsed', !State.sidebarOpen);
    expTab.classList.toggle('hidden', State.sidebarOpen);
  },

  togglePanel() {
    State.panelOpen = !State.panelOpen;
    const panel  = document.getElementById('wochenliste-panel');
    const expTab = document.getElementById('panel-expand-tab');
    panel.classList.toggle('collapsed', !State.panelOpen);
    expTab.classList.toggle('hidden', State.panelOpen);
  },

  // ── Export ────────────────────────────────────────────────
  copyList() {
    const grouped = ShoppingList.generate();
    const text    = ShoppingList.toText(grouped);
    navigator.clipboard.writeText(text).then(() => {
      Render.toast('In Zwischenablage kopiert!', 'success');
    }).catch(() => {
      Render.toast('Kopieren fehlgeschlagen – bitte manuell kopieren.', 'error');
    });
  },

  async exportICS() {
    const grouped  = ShoppingList.generate();
    const ics      = ShoppingList.toICS(grouped);
    const date     = new Date().toISOString().slice(0, 10);
    const filename = `einkaufsliste_${date}.ics`;
    const blob     = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const file     = new File([blob], filename, { type: 'text/calendar' });

    // Web Share API: iOS zeigt das native Teilen-Menü → "Erinnerungen" auswählen
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Einkaufsliste' });
      } catch (err) {
        if (err.name !== 'AbortError') downloadBlob(ics, filename, 'text/calendar;charset=utf-8');
      }
    } else {
      // Fallback für Desktop-Browser
      downloadBlob(ics, filename, 'text/calendar;charset=utf-8');
    }
  },

  exportAppleScript() {
    const grouped = ShoppingList.generate();
    const script  = ShoppingList.toAppleScript(grouped);
    const date    = new Date().toISOString().slice(0, 10);
    downloadBlob(script, `einkaufsliste_${date}.applescript`, 'text/plain;charset=utf-8');
    Render.toast('Datei heruntergeladen. In Script Editor öffnen und ▶ klicken.', 'info');
  },

  backupExport() {
    const data = {
      version:     1,
      exportedAt:  new Date().toISOString(),
      recipes:     State.recipes,
      wochenliste: State.wochenliste,
    };
    const date = new Date().toISOString().slice(0, 10);
    downloadBlob(JSON.stringify(data, null, 2), `rezepte-backup_${date}.json`, 'application/json;charset=utf-8');
    Render.toast(`${State.recipes.length} Rezepte exportiert.`, 'success');
  },

  backupImport(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data.recipes)) throw new Error('Ungültiges Format');
        const before = State.recipes.length;
        // Merge: add recipes not already present (by id)
        const existingIds = new Set(State.recipes.map(r => r.id));
        const newRecipes  = data.recipes.filter(r => !existingIds.has(r.id));
        State.recipes = [...State.recipes, ...newRecipes];
        Storage.saveRecipes();
        Router.refresh();
        Render.toast(`${newRecipes.length} neue Rezepte importiert (${before} waren bereits vorhanden).`, 'success');
      } catch (err) {
        Render.toast('Backup-Datei ungültig.', 'error');
      }
    };
    reader.readAsText(file);
  },

  exportTxt() {
    const grouped = ShoppingList.generate();
    const text    = ShoppingList.toText(grouped);
    const date    = new Date().toISOString().slice(0, 10);
    downloadBlob(text, `einkaufsliste_${date}.txt`, 'text/plain;charset=utf-8');
    Render.toast('Einkaufsliste als .txt exportiert.');
  },

  printList() {
    const grouped     = ShoppingList.generate();
    const printDiv    = document.getElementById('print-only');
    const date        = new Date().toLocaleDateString('de-DE');
    const entries    = WochenlisteStore.getEntries();
    const totalPort  = entries.reduce((s, e) => s + e.portions, 0);
    const portNote   = totalPort > 0 ? ` · ${totalPort} Portionen` : '';

    let html = `<h1>Einkaufsliste</h1><p style="color:#777;font-size:10pt;">${date}${portNote}</p>`;

    for (const cat of SHOP_CATEGORIES) {
      const items = grouped[cat];
      if (!items || items.length === 0) continue;
      html += `<div class="print-category"><h2>${SHOP_CAT_ICONS[cat]} ${cat}</h2>`;
      for (const item of items) {
        const amount = item.amount ? `${item.amount} ` : '';
        html += `<div class="print-item">${amount}${item.name}</div>`;
      }
      html += '</div>';
    }

    if (printDiv) printDiv.innerHTML = html;
    window.print();
  },

  onCheckboxToggle(checkbox) {
    const key     = checkbox.dataset.key;
    const label   = checkbox.closest('label.shopping-item');
    if (checkbox.checked) {
      State.checkedItems.add(key);
      label?.classList.add('checked');
    } else {
      State.checkedItems.delete(key);
      label?.classList.remove('checked');
    }
  },
};


// ============================================================
// UTILITIES
// ============================================================

function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}


// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  Storage.load();
  Handlers.setup();
  Router.navigate('rezepte');
  Render.updateWochenlistePanel();
});
