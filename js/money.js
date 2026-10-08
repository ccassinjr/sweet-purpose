// @ts-check

/** Money is always shown as £3.75, never "£ 3,75", whatever the visitor's language */
const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

/**
 * @param {number} pence
 * @returns {string}
 */
export function formatPrice(pence) {
  return money.format(pence / 100);
}
