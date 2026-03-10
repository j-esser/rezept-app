/**
 * Netlify Function: fetch-recipe
 * Fetches a recipe URL server-side (bypasses CORS) and extracts
 * structured recipe data from JSON-LD (schema.org/Recipe).
 *
 * Usage: GET /.netlify/functions/fetch-recipe?url=https://...
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};

exports.handler = async (event) => {
  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const url = event.queryStringParameters?.url;
  if (!url || !url.startsWith('http')) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Fehlende oder ungültige URL.' }),
    };
  }

  let html;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
    });
    if (!res.ok) {
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: `Seite nicht erreichbar (HTTP ${res.status}).` }),
      };
    }
    html = await res.text();
  } catch (e) {
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: `Fehler beim Abrufen: ${e.message}` }),
    };
  }

  // Extract all JSON-LD blocks
  const ldBlocks = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    try {
      ldBlocks.push(JSON.parse(match[1]));
    } catch {
      // malformed JSON-LD, skip
    }
  }

  // Find Recipe object (may be nested in @graph)
  const recipeSchema = findRecipe(ldBlocks);
  if (!recipeSchema) {
    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Kein strukturiertes Rezept (JSON-LD) auf dieser Seite gefunden.' }),
    };
  }

  const recipe = mapToAppFormat(recipeSchema, url, html);
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(recipe),
  };
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function findRecipe(blocks) {
  for (const block of blocks) {
    // Direct Recipe
    if (isRecipe(block)) return block;
    // @graph array
    if (block['@graph'] && Array.isArray(block['@graph'])) {
      const found = block['@graph'].find(isRecipe);
      if (found) return found;
    }
    // Array of objects
    if (Array.isArray(block)) {
      const found = block.find(isRecipe);
      if (found) return found;
    }
  }
  return null;
}

function isRecipe(obj) {
  if (!obj || typeof obj !== 'object') return false;
  const type = obj['@type'];
  if (Array.isArray(type)) return type.includes('Recipe');
  return type === 'Recipe';
}

function mapToAppFormat(schema, sourceUrl, html) {
  const description = extractInstructions(schema.recipeInstructions)
    || extractMetaDescription(html)
    || '';
  return {
    title:       extractText(schema.name) || 'Unbekanntes Rezept',
    description,
    cookTime:    parseDuration(schema.totalTime || schema.cookTime) || 40,
    portions:    parseYield(schema.recipeYield) || 2,
    reference:   sourceUrl,
    categories:  extractCategories(schema.recipeCategory),
    ingredients: (schema.recipeIngredient || []).map(parseIngredient),
    nutrition:   extractNutrition(schema.nutrition),
  };
}

function extractNutrition(n) {
  if (!n) return { kcal: null, protein: null, fat: null, carbs: null };
  return {
    kcal:    parseNutritionValue(n.calories),
    protein: parseNutritionValue(n.proteinContent),
    fat:     parseNutritionValue(n.fatContent),
    carbs:   parseNutritionValue(n.carbohydrateContent),
  };
}

function parseNutritionValue(val) {
  if (val == null) return null;
  const m = String(val).match(/[\d.,]+/);
  if (!m) return null;
  const n = Math.round(parseFloat(m[0].replace(',', '.')));
  return isNaN(n) ? null : n;
}

function extractMetaDescription(html) {
  if (!html) return '';
  // og:description first (usually more detailed)
  const og = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{20,})["']/i)
           || html.match(/<meta[^>]+content=["']([^"']{20,})["'][^>]+property=["']og:description["']/i);
  if (og) return decodeHtmlEntities(og[1]);
  // fallback: meta name=description
  const m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{20,})["']/i)
          || html.match(/<meta[^>]+content=["']([^"']{20,})["'][^>]+name=["']description["']/i);
  if (m) return decodeHtmlEntities(m[1]);
  return '';
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function extractText(val) {
  if (!val) return '';
  if (typeof val === 'string') return val.trim();
  if (Array.isArray(val)) return val.map(extractText).join(', ');
  if (val.text) return val.text.trim();
  return String(val).trim();
}

function extractInstructions(instructions) {
  if (!instructions) return '';
  let text = '';
  if (typeof instructions === 'string') {
    text = stripHtml(instructions);
  } else if (Array.isArray(instructions)) {
    text = instructions
      .map(step => {
        if (typeof step === 'string') return stripHtml(step);
        return stripHtml(step.text || step.name || '');
      })
      .filter(Boolean)
      .join(' ');
  }
  // Ignore placeholder text shorter than 30 chars (e.g. just "Zubereitung")
  return text.length >= 30 ? text : '';
}

function extractCategories(cat) {
  if (!cat) return [];
  const raw = Array.isArray(cat) ? cat : [cat];
  // Map common German/English recipe categories to app tabs
  const MAP = {
    pasta: 'Pasta', nudel: 'Pasta',
    suppe: 'Suppe', soup: 'Suppe',
    curry: 'Curry',
    reis: 'Reis', rice: 'Reis',
    salat: 'Salat', salad: 'Salat',
    fisch: 'Fisch', fish: 'Fisch', seafood: 'Fisch',
    fleisch: 'Fleisch', meat: 'Fleisch', chicken: 'Fleisch',
    vegetarisch: 'Vegetarisch', vegetarian: 'Vegetarisch', vegan: 'Vegetarisch',
    eintopf: 'Eintopf', stew: 'Eintopf',
  };
  const result = new Set();
  for (const c of raw) {
    const lower = String(c).toLowerCase();
    for (const [key, val] of Object.entries(MAP)) {
      if (lower.includes(key)) result.add(val);
    }
  }
  return result.size > 0 ? [...result] : [];
}

/** ISO 8601 duration: PT45M, PT1H30M → minutes */
function parseDuration(str) {
  if (!str) return null;
  if (typeof str === 'number') return str;
  const m = String(str).match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!m) return null;
  return (parseInt(m[1] || 0) * 60) + parseInt(m[2] || 0);
}

function parseYield(val) {
  if (!val) return null;
  const str = Array.isArray(val) ? val[0] : String(val);
  const m = String(str).match(/\d+/);
  return m ? parseInt(m[0]) : null;
}

/**
 * Parse a schema.org recipeIngredient string into { amount, name, shopCategory }.
 * shopCategory is left as 'Sonstiges' — the frontend classifies it via its own dictionary.
 */
function parseIngredient(line) {
  const raw = stripHtml(String(line)).trim();

  // Match leading number + unit
  const m = raw.match(
    /^([\d.,½¼¾⅓⅔\s\/]+)\s*(g|kg|ml|cl|dl|l|EL|TL|Esslöffel|Teelöffel|Prise|Bund|Dose|Glas|Packung|Päckchen|Paket|Tüte|Stück|Stk|Scheibe|Scheiben|Zehe|Zehen|Handvoll|Tasse|cm|Msp|El|Tl)\b\.?\s*(.*)/i
  );
  if (m) {
    return { amount: `${m[1].trim()} ${m[2]}`, name: m[3].trim(), shopCategory: 'Sonstiges' };
  }

  // Number without unit (e.g. "3 Eier")
  const m2 = raw.match(/^([\d.,½¼¾⅓⅔]+)\s+(.+)/);
  if (m2) {
    return { amount: m2[1].trim(), name: m2[2].trim(), shopCategory: 'Sonstiges' };
  }

  return { amount: '', name: raw, shopCategory: 'Sonstiges' };
}

function stripHtml(str) {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
