// @ts-check

/** Days between ordering and the earliest date a customer can pick. Waiting on the client */
export const MIN_NOTICE_DAYS = 1;

/**
 * International format, no plus sign or spaces, as wa.me expects.
 * Also written by hand in index.html: the link after the products, the <noscript> line, the catalogue error template and the footer.
 */
export const WHATSAPP_NUMBER = '447547266089';

/** @typedef {'cocadas' | 'classicos' | 'biscoitos' | 'balas' | 'brigadeiros' | 'mini-coquelitas' | 'amanteigados-gourmet' | 'frescos' | 'pascoa'} CategoryId */
/** @typedef {'leite' | 'amendoim' | 'castanhas' | 'gluten' | 'soja' | 'sulfitos'} Allergen */
/** @typedef {'trigo' | 'cevada'} Cereal  UK rules name the cereal behind gluten */

/**
 * @typedef {object} Allergens
 * @property {Allergen[]} contains     in the order content.md lists them
 * @property {Cereal[]} [glutenFrom]   only when contains has 'gluten'
 * @property {Allergen[]} mayContain
 */

/**
 * One orderable row, with its own price and its own stepper.
 * @typedef {object} Size
 * @property {string} label   shown and sent as written: '100g', '12 unidades'
 * @property {number} pence   375 is £3.75. Whole pence, so totals never pick up rounding errors
 */

/**
 * Card photos use alt="", because the product name sits right beside them.
 * @typedef {object} Photo
 * @property {string} position   CSS object-position: 'center', or e.g. '50% 70%' when the sweet sits off-centre
 */

/**
 * @typedef {object} LiveProduct
 * @property {'live'} status
 * @property {string} id             lowercase-with-hyphens, also the photo file: assets/products/<id>.jpg
 * @property {string} name
 * @property {CategoryId} category
 * @property {string} ingredients    copied as written in content.md
 * @property {Allergens} allergens
 * @property {Size[]} sizes
 * @property {Photo} [photo]         leave out until there's a photo; the card shows "Foto em breve"
 */

/**
 * A menu sweet waiting for its recipe and allergens. Never shown.
 * @typedef {object} PlaceholderProduct
 * @property {'hidden'} status
 * @property {string} id
 * @property {string} name
 * @property {CategoryId} category
 * @property {string} [note]   e.g. 'Só retirada ou entrega local', 'Never call them gluten free'
 */

/** @typedef {LiveProduct | PlaceholderProduct} Product */

/**
 * @typedef {object} Category
 * @property {CategoryId} id
 * @property {string} title
 * @property {string} [note]   shown beside the title
 */

/** In display order. A category with no live products doesn't render. @type {Category[]} */
export const CATEGORIES = [
  { id: 'cocadas', title: 'Cocadas' },
  { id: 'classicos', title: 'Clássicos Brasileiros' },
  { id: 'biscoitos', title: 'Biscoitos amanteigados' },
  { id: 'balas', title: 'Balas Caramelizadas', note: '25g cada' },
  { id: 'brigadeiros', title: 'Brigadeiros' },
  { id: 'mini-coquelitas', title: 'Mini Coquelitas' },
  { id: 'amanteigados-gourmet', title: 'Amanteigados Gourmet' },
  { id: 'frescos', title: 'Frescos' },
  { id: 'pascoa', title: 'Páscoa' },
];

/**
 * One dictionary, so the Portuguese and English allergen lines can't drift apart.
 * @type {Record<Allergen, { pt: string, en: string }>}
 */
export const ALLERGEN_NAMES = {
  leite: { pt: 'leite', en: 'milk' },
  amendoim: { pt: 'amendoim', en: 'peanuts' },
  castanhas: { pt: 'castanhas', en: 'tree nuts' },
  gluten: { pt: 'glúten', en: 'gluten' },
  soja: { pt: 'soja', en: 'soya' },
  sulfitos: { pt: 'sulfitos', en: 'sulphites' },
};

/** @type {Record<Cereal, { pt: string, en: string }>} */
export const CEREAL_NAMES = {
  trigo: { pt: 'trigo', en: 'wheat' },
  cevada: { pt: 'cevada', en: 'barley' },
};

/** @type {Product[]} */
export const PRODUCTS = [
  // Cocadas
  {
    status: 'live',
    id: 'cocada-branca',
    name: 'Cocada Branca',
    category: 'cocadas',
    ingredients: 'leite condensado, açúcar, coco fresco',
    allergens: { contains: ['leite'], mayContain: ['amendoim', 'castanhas', 'gluten'] },
    sizes: [{ label: '100g', pence: 375 }],
    // No photo yet: waiting on the client
  },
  {
    status: 'live',
    id: 'cocada-queimada',
    name: 'Cocada Queimada',
    category: 'cocadas',
    ingredients: 'leite condensado, açúcar, coco fresco',
    allergens: { contains: ['leite'], mayContain: ['amendoim', 'castanhas', 'gluten'] },
    sizes: [{ label: '100g', pence: 375 }],
    photo: { position: '50% 78%' },
  },
  {
    status: 'live',
    id: 'cocada-de-maracuja',
    name: 'Cocada de Maracujá',
    category: 'cocadas',
    ingredients: 'leite condensado, açúcar, coco fresco, polpa de maracujá, suco concentrado de maracujá Maguary',
    allergens: { contains: ['leite', 'sulfitos'], mayContain: ['amendoim', 'castanhas', 'gluten'] },
    sizes: [{ label: '100g', pence: 400 }],
    photo: { position: '50% 52%' },
  },
  {
    status: 'live',
    id: 'cocada-de-abacaxi',
    name: 'Cocada de Abacaxi',
    category: 'cocadas',
    ingredients: 'leite condensado, açúcar, coco fresco, abacaxi',
    allergens: { contains: ['leite'], mayContain: ['amendoim', 'castanhas', 'gluten'] },
    sizes: [{ label: '100g', pence: 400 }],
    photo: { position: '50% 72%' },
  },
  {
    status: 'live',
    id: 'cocada-de-limao',
    name: 'Cocada de Limão',
    category: 'cocadas',
    ingredients: 'leite condensado, coco fresco, suco de limão, açúcar',
    allergens: { contains: ['leite'], mayContain: ['amendoim', 'castanhas', 'gluten'] },
    sizes: [{ label: '100g', pence: 400 }],
    // No photo yet: none of the candidates shows it
  },
  {
    status: 'live',
    id: 'cocada-de-chocolate',
    name: 'Cocada de Chocolate',
    category: 'cocadas',
    ingredients: 'leite condensado, coco fresco, cacau em pó',
    allergens: { contains: ['leite'], mayContain: ['amendoim', 'castanhas', 'gluten'] },
    sizes: [{ label: '100g', pence: 400 }],
    photo: { position: '50% 45%' },
  },

  // Clássicos Brasileiros
  {
    status: 'live',
    id: 'palha-italiana-com-oreo',
    name: 'Palha Italiana com Oreo',
    category: 'classicos',
    ingredients: 'leite condensado, Elmlea Double (alternativa ao creme de leite), leite em pó Nido, biscoito Oreo',
    allergens: { contains: ['gluten', 'leite', 'soja'], glutenFrom: ['trigo'], mayContain: ['amendoim', 'castanhas'] },
    sizes: [{ label: '100g', pence: 400 }],
    photo: { position: '50% 60%' },
  },
  {
    status: 'live',
    id: 'palha-italiana-ninho',
    name: 'Palha Italiana Ninho',
    category: 'classicos',
    ingredients: 'leite condensado, leite em pó Nido, manteiga com óleo de canola, biscoito Rich Tea',
    allergens: { contains: ['gluten', 'leite', 'soja'], glutenFrom: ['trigo', 'cevada'], mayContain: ['amendoim', 'castanhas'] },
    sizes: [{ label: '100g', pence: 375 }],
    photo: { position: '50% 45%' },
  },
  {
    status: 'live',
    id: 'pe-de-moleque',
    name: 'Pé de Moleque',
    category: 'classicos',
    ingredients: 'amendoim, açúcar, manteiga com óleo de canola',
    allergens: { contains: ['amendoim', 'leite'], mayContain: ['castanhas', 'gluten'] },
    sizes: [{ label: '100g', pence: 375 }],
    photo: { position: '50% 50%' },
  },
  {
    status: 'live',
    id: 'pe-de-moca',
    name: 'Pé de Moça',
    category: 'classicos',
    ingredients: 'amendoim, leite condensado, Elmlea Double (alternativa ao creme de leite), açúcar, manteiga com óleo de canola',
    allergens: { contains: ['amendoim', 'leite', 'soja'], mayContain: ['castanhas', 'gluten'] },
    sizes: [{ label: '100g', pence: 375 }],
    // No photo yet: waiting on the client
  },
  {
    status: 'live',
    id: 'doce-de-leite',
    name: 'Doce de Leite',
    category: 'classicos',
    ingredients: 'leite condensado, leite semidesnatado, açúcar',
    allergens: { contains: ['leite'], mayContain: ['amendoim', 'castanhas', 'gluten'] },
    sizes: [{ label: '100g', pence: 375 }],
    // No photo yet: none of the candidates shows it plain
  },

  // Biscoitos amanteigados
  {
    status: 'live',
    id: 'casadinho-de-goiabada',
    name: 'Casadinho de Goiabada',
    category: 'biscoitos',
    ingredients: 'manteiga com óleo de canola, açúcar, farinha de trigo, goiabada',
    allergens: { contains: ['gluten', 'leite'], glutenFrom: ['trigo'], mayContain: ['amendoim', 'castanhas'] },
    sizes: [{ label: '100g', pence: 375 }],
    photo: { position: '50% 50%' },
  },
  {
    status: 'live',
    id: 'casadinho-de-doce-de-leite',
    name: 'Casadinho de Doce de Leite',
    category: 'biscoitos',
    ingredients:
      'manteiga com óleo de canola, açúcar, farinha de trigo, doce de leite (leite condensado, leite semidesnatado, açúcar, manteiga com óleo de canola)',
    allergens: { contains: ['gluten', 'leite'], glutenFrom: ['trigo'], mayContain: ['amendoim', 'castanhas'] },
    sizes: [{ label: '100g', pence: 375 }],
    photo: { position: '50% 62%' },
  },

  // Balas Caramelizadas
  {
    status: 'live',
    id: 'bala-de-coco',
    name: 'Bala de Coco',
    category: 'balas',
    ingredients: 'coco fresco, leite condensado, Elmlea Single (alternativa ao creme de leite), caramelo (açúcar, vinagre de álcool)',
    allergens: { contains: ['leite'], mayContain: ['amendoim', 'castanhas', 'gluten'] },
    sizes: [
      { label: '6 unidades', pence: 800 },
      { label: '12 unidades', pence: 1500 },
      { label: '24 unidades', pence: 2800 },
    ],
    // No photo yet: waiting on the client
  },

  // Placeholders: hidden until each recipe and its allergens are confirmed
  { status: 'hidden', id: 'bala-de-ameixa', name: 'Ameixa', category: 'balas' },
  { status: 'hidden', id: 'bala-de-abacaxi', name: 'Abacaxi', category: 'balas' },
  { status: 'hidden', id: 'bala-de-maracuja', name: 'Maracujá', category: 'balas' },
  { status: 'hidden', id: 'bala-de-limao', name: 'Limão', category: 'balas' },
  { status: 'hidden', id: 'bala-de-laranja', name: 'Laranja', category: 'balas' },
  { status: 'hidden', id: 'bala-de-frutas-vermelhas', name: 'Frutas vermelhas', category: 'balas' },
  { status: 'hidden', id: 'bala-de-bicho-de-pe', name: 'Bicho de pé', category: 'balas' },
  { status: 'hidden', id: 'bala-de-prestigio', name: 'Prestígio', category: 'balas' },
  { status: 'hidden', id: 'bala-de-churros', name: 'Churros', category: 'balas' },
  { status: 'hidden', id: 'bala-de-romeu-e-julieta', name: 'Romeu e Julieta', category: 'balas' },
  { status: 'hidden', id: 'bala-de-ourico-de-coco', name: 'Ouriço de coco', category: 'balas' },
  { status: 'hidden', id: 'bala-de-cajuzinho', name: 'Cajuzinho', category: 'balas' },
  { status: 'hidden', id: 'bala-de-pistache', name: 'Pistache', category: 'balas' },
  { status: 'hidden', id: 'bala-de-avela', name: 'Avelã', category: 'balas' },

  { status: 'hidden', id: 'brigadeiro-preto', name: 'Brigadeiro Preto', category: 'brigadeiros' },
  { status: 'hidden', id: 'brigadeiro-branco', name: 'Brigadeiro Branco', category: 'brigadeiros' },
  { status: 'hidden', id: 'brigadeiro-casadinho', name: 'Brigadeiro Casadinho', category: 'brigadeiros' },
  { status: 'hidden', id: 'brigadeiro-branco-com-caramelo-colorido', name: 'Brigadeiro Branco com caramelo colorido', category: 'brigadeiros' },

  { status: 'hidden', id: 'mini-coquelita-coco-cremoso', name: 'Coco cremoso', category: 'mini-coquelitas' },
  { status: 'hidden', id: 'mini-coquelita-coco-com-maracuja', name: 'Coco com maracujá', category: 'mini-coquelitas' },
  { status: 'hidden', id: 'mini-coquelita-coco-com-pistache', name: 'Coco com pistache', category: 'mini-coquelitas' },

  { status: 'hidden', id: 'bananinha', name: 'Bananinha', category: 'classicos' },
  { status: 'hidden', id: 'sequilhos', name: 'Sequilhos', category: 'biscoitos', note: 'Never call them gluten free' },

  { status: 'hidden', id: 'amanteigado-chocolate', name: 'Chocolate', category: 'amanteigados-gourmet' },
  { status: 'hidden', id: 'amanteigado-chocolate-chips', name: 'Chocolate Chips', category: 'amanteigados-gourmet' },
  { status: 'hidden', id: 'amanteigado-nutella', name: 'Nutella', category: 'amanteigados-gourmet' },
  { status: 'hidden', id: 'amanteigado-kinder', name: 'Kinder', category: 'amanteigados-gourmet' },
  { status: 'hidden', id: 'amanteigado-caramelo-salgado', name: 'Caramelo Salgado', category: 'amanteigados-gourmet' },
  { status: 'hidden', id: 'amanteigado-pistache', name: 'Pistache', category: 'amanteigados-gourmet' },
  { status: 'hidden', id: 'amanteigado-red-velvet', name: 'Red Velvet', category: 'amanteigados-gourmet' },
  { status: 'hidden', id: 'amanteigado-ferrero-rocher', name: 'Ferrero Rocher', category: 'amanteigados-gourmet' },
  { status: 'hidden', id: 'amanteigado-limao-siciliano', name: 'Limão Siciliano', category: 'amanteigados-gourmet' },
  { status: 'hidden', id: 'amanteigado-churros', name: 'Churros', category: 'amanteigados-gourmet' },
  { status: 'hidden', id: 'amanteigado-gengibre', name: 'Gengibre', category: 'amanteigados-gourmet' },
  { status: 'hidden', id: 'amanteigado-nozes', name: 'Nozes', category: 'amanteigados-gourmet' },
  { status: 'hidden', id: 'amanteigado-chocolate-belga', name: 'Biscoito amanteigado banhado no chocolate belga', category: 'amanteigados-gourmet' },
  { status: 'hidden', id: 'biscoito-amanteigado-de-nutella', name: 'Biscoito amanteigado de Nutella', category: 'amanteigados-gourmet' },

  { status: 'hidden', id: 'morango-do-amor', name: 'Morango do amor', category: 'frescos', note: 'Só retirada ou entrega local' },
  { status: 'hidden', id: 'uvas-caramelizadas', name: 'Uvas caramelizadas', category: 'frescos', note: 'Só retirada ou entrega local' },

  { status: 'hidden', id: 'pascoa-biscoitos-recheados', name: 'Biscoitos recheados de chocolate e pistache', category: 'pascoa', note: 'Sazonal' },
  { status: 'hidden', id: 'pascoa-ovo-flat', name: 'Ovo flat', category: 'pascoa', note: 'Sazonal' },
];

/**
 * Narrows a product to a live one, so code that renders cards can rely on sizes and allergens existing.
 * @param {Product} product
 * @returns {product is LiveProduct}
 */
export function isLive(product) {
  return product.status === 'live';
}
