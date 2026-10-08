// @ts-check

/**
 * Quantity per basket key. Keys are the product id plus the size position, like 'cocada-branca:0'.
 * A key only exists while its quantity is above 0.
 * @typedef {ReadonlyMap<string, number>} Basket
 */

/**
 * One orderable size, as the basket needs to know it.
 * @typedef {object} SizeInfo
 * @property {string} key
 * @property {string} name        product name
 * @property {string} sizeLabel   '100g', '12 unidades'
 * @property {number} pence
 */

/**
 * One line of the order: a size and how many of it.
 * @typedef {SizeInfo & { quantity: number, linePence: number }} OrderLine
 */

export const MAX_QUANTITY = 99;

/**
 * The position in the key, never the label, so a renamed label can't break an existing basket.
 * @param {string} productId
 * @param {number} sizeIndex
 * @returns {string}
 */
export function basketKey(productId, sizeIndex) {
  return `${productId}:${sizeIndex}`;
}

/** @returns {Basket} */
export function emptyBasket() {
  return new Map();
}

/**
 * @param {Basket} basket
 * @param {string} key
 * @returns {number}
 */
export function quantityOf(basket, key) {
  return basket.get(key) ?? 0;
}

/**
 * Returns a new basket and leaves the old one alone, so a change is always a comparison away.
 * @param {Basket} basket
 * @param {string} key
 * @param {number} quantity   clamped to 0 to MAX_QUANTITY
 * @returns {Basket}
 */
export function setQuantity(basket, key, quantity) {
  const clamped = Math.min(MAX_QUANTITY, Math.max(0, Math.trunc(quantity)));
  const next = new Map(basket);
  if (clamped === 0) next.delete(key);
  else next.set(key, clamped);
  return next;
}

/**
 * @param {Basket} basket
 * @param {string} key
 * @param {number} delta   +1 or -1
 * @returns {Basket}
 */
export function changeQuantity(basket, key, delta) {
  return setQuantity(basket, key, quantityOf(basket, key) + delta);
}

/**
 * Every size on the menu, in menu order, so order lines come out in the same order as the cards.
 * @param {ReadonlyArray<import('./products.js').LiveProduct>} products
 * @returns {Map<string, SizeInfo>}
 */
export function indexSizes(products) {
  /** @type {Map<string, SizeInfo>} */
  const sizes = new Map();
  for (const product of products) {
    product.sizes.forEach((size, index) => {
      const key = basketKey(product.id, index);
      sizes.set(key, { key, name: product.name, sizeLabel: size.label, pence: size.pence });
    });
  }
  return sizes;
}

/**
 * The order lines, in menu order. A key the menu no longer knows is skipped
 * @param {Basket} basket
 * @param {ReadonlyMap<string, SizeInfo>} sizes
 * @returns {OrderLine[]}
 */
export function orderLines(basket, sizes) {
  /** @type {OrderLine[]} */
  const lines = [];
  for (const [key, size] of sizes) {
    const quantity = quantityOf(basket, key);
    if (quantity > 0) lines.push({ ...size, quantity, linePence: size.pence * quantity });
  }
  return lines;
}

/**
 * @param {ReadonlyArray<OrderLine>} lines
 * @returns {number}
 */
export function totalPence(lines) {
  return lines.reduce((sum, line) => sum + line.linePence, 0);
}

/**
 * Sum of quantities: 2 Cocada Branca and 1 Bala de Coco make 3 itens
 * @param {Basket} basket
 * @returns {number}
 */
export function itemCount(basket) {
  let count = 0;
  for (const quantity of basket.values()) count += quantity;
  return count;
}

/**
 * @param {number} count
 * @returns {string}   '1 item', '2 itens'
 */
export function itemsLabel(count) {
  return count === 1 ? '1 item' : `${count} itens`;
}
