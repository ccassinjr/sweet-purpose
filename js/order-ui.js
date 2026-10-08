// @ts-check
import { basketKey } from './basket.js';
import { formatPrice } from './money.js';
import { ALLERGEN_NAMES, CATEGORIES, CEREAL_NAMES, PRODUCTS, isLive } from './products.js';

/** @typedef {import('./products.js').Allergens} Allergens */
/** @typedef {import('./products.js').LiveProduct} LiveProduct */
/** @typedef {import('./products.js').Category} Category */

/**
 * Finds an element the page must have. Failing loudly here is better than a card that silently stays empty.
 * @template {Element} T
 * @param {ParentNode} parent
 * @param {string} selector
 * @returns {T}
 */
export function mustFind(parent, selector) {
  const element = /** @type {T | null} */ (parent.querySelector(selector));
  if (!element) throw new Error(`Missing ${selector} in index.html`);
  return element;
}

/**
 * One sentence of the allergen line: "Contains: milk, gluten (wheat)."
 * The cereal behind gluten goes in brackets, as UK labelling rules ask.
 * @param {Allergens} allergens
 * @param {'pt' | 'en'} language
 * @returns {{ contains: string, mayContain: string }}
 */
export function allergenLists(allergens, language) {
  const names = allergens.contains.map((allergen) => {
    const name = ALLERGEN_NAMES[allergen][language];
    if (allergen !== 'gluten' || !allergens.glutenFrom) return name;
    const cereals = allergens.glutenFrom.map((cereal) => CEREAL_NAMES[cereal][language]);
    return `${name} (${cereals.join(', ')})`;
  });
  return {
    contains: names.join(', '),
    mayContain: allergens.mayContain.map((allergen) => ALLERGEN_NAMES[allergen][language]).join(', '),
  };
}

/**
 * Fills one allergen line: a bold label, then the list.
 * @param {Element} line
 * @param {{ contains: string, mayContain: string }} lists
 * @param {{ contains: string, mayContain: string }} labels
 */
function fillAllergenLine(line, lists, labels) {
  const pieces = [
    [labels.contains, lists.contains],
    [labels.mayContain, lists.mayContain],
  ];
  line.replaceChildren();
  pieces.forEach(([label, list], index) => {
    const labelEl = document.createElement('span');
    labelEl.className = 'product__allergen-label';
    labelEl.textContent = label;
    line.append(labelEl, ` ${list}${index === 0 ? '. ' : ''}`);
  });
}

/**
 * @param {HTMLTemplateElement} template
 * @param {LiveProduct} product
 * @returns {DocumentFragment}
 */
function buildProductCard(template, product) {
  const card = /** @type {DocumentFragment} */ (template.content.cloneNode(true));

  const article = mustFind(card, '.product');
  article.id = product.id;
  article.setAttribute('aria-labelledby', `${product.id}-name`);

  const name = mustFind(card, '.product__name');
  name.id = `${product.id}-name`;
  name.textContent = product.name;

  mustFind(card, '.product__ingredients').textContent = `Ingredientes: ${product.ingredients}`;

  // English first, Portuguese second, same size: allergen information must be in English
  fillAllergenLine(mustFind(card, '.product__allergen-line--en'), allergenLists(product.allergens, 'en'), {
    contains: 'Contains:',
    mayContain: 'May contain:',
  });
  fillAllergenLine(mustFind(card, '.product__allergen-line--pt'), allergenLists(product.allergens, 'pt'), {
    contains: 'Contém:',
    mayContain: 'Pode conter:',
  });

  const photo = /** @type {HTMLImageElement} */ (mustFind(card, '.product__photo--image'));
  const placeholder = mustFind(card, '.product__photo--empty');
  if (product.photo) {
    photo.src = `assets/products/${product.id}.jpg`;
    photo.style.objectPosition = product.photo.position;
    placeholder.remove();
  } else {
    photo.remove();
  }

  const sizes = mustFind(card, '.product__sizes');
  const sizeTemplate = mustFind(sizes, '.size');
  sizeTemplate.remove();
  product.sizes.forEach((size, index) => {
    const row = /** @type {HTMLElement} */ (sizeTemplate.cloneNode(true));
    row.dataset.key = basketKey(product.id, index);
    mustFind(row, '.size__label').textContent = size.label;
    mustFind(row, '.size__price').textContent = formatPrice(size.pence);
    // The buttons are named after the sweet, so a screen reader can tell the rows apart
    mustFind(row, '[data-action="plus"]').setAttribute('aria-label', `Mais ${product.name}, ${size.label}`);
    mustFind(row, '[data-action="minus"]').setAttribute('aria-label', `Menos ${product.name}, ${size.label}`);
    sizes.append(row);
  });

  return card;
}

/**
 * @param {Category} category
 * @param {number} index
 * @returns {{ section: HTMLElement, list: HTMLElement }}
 */
function buildCategory(category, index) {
  const section = document.createElement('section');
  section.className = 'category';
  section.setAttribute('aria-labelledby', `category-${index}`);

  const head = document.createElement('div');
  head.className = 'category__head';

  const title = document.createElement('h3');
  title.className = 'category__title';
  title.id = `category-${index}`;
  title.textContent = category.title;
  head.append(title);

  if (category.note) {
    const note = document.createElement('p');
    note.className = 'category__note';
    note.textContent = category.note;
    head.append(note);
  }

  const list = document.createElement('ul');
  list.className = 'products';
  // Safari drops list semantics once the bullets are removed, so the role puts them back
  list.setAttribute('role', 'list');

  section.append(head, list);
  return { section, list };
}

/**
 * The live products in the order the page shows them: by category, in menu order.
 * Hidden placeholders never appear.
 * @returns {LiveProduct[]}
 */
export function menuProducts() {
  const liveProducts = PRODUCTS.filter(isLive);
  return CATEGORIES.flatMap((category) => liveProducts.filter((product) => product.category === category.id));
}

/**
 * Draws every live product, grouped by category in menu order.
 * Empty categories never reach the page.
 */
export function renderCatalogue() {
  const container = mustFind(document, '#products');
  const template = /** @type {HTMLTemplateElement} */ (mustFind(document, '#product-template'));
  const liveProducts = menuProducts();

  const sections = [];
  for (const category of CATEGORIES) {
    const products = liveProducts.filter((product) => product.category === category.id);
    if (products.length === 0) continue;

    const { section, list } = buildCategory(category, sections.length);
    for (const product of products) {
      const item = document.createElement('li');
      item.append(buildProductCard(template, product));
      list.append(item);
    }
    sections.push(section);
  }

  container.replaceChildren(...sections);
}

/**
 * Replaces the product list with a message and a WhatsApp link, for when renderCatalogue() fails.
 * The wording lives in index.html, next to the <noscript> copy, so a customer can always still order.
 */
export function showCatalogueError() {
  const container = mustFind(document, '#products');
  const template = /** @type {HTMLTemplateElement} */ (mustFind(document, '#catalogue-error-template'));
  container.replaceChildren(template.content.cloneNode(true));
}
