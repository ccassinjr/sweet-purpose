// @ts-check
import {
  MAX_QUANTITY,
  changeQuantity,
  emptyBasket,
  indexSizes,
  itemCount,
  itemsLabel,
  orderLines,
  quantityOf,
  totalPence,
} from './basket.js';
import { dateError, earliestDate, methodError, toInputValue } from './details.js';
import { formatPrice, mustFind } from './order-ui.js';
import { MIN_NOTICE_DAYS } from './products.js';

/** @typedef {import('./basket.js').Basket} Basket */
/** @typedef {import('./basket.js').SizeInfo} SizeInfo */
/** @typedef {import('./products.js').LiveProduct} LiveProduct */

/*
 * The one place the page changes when the basket does.
 *
 * Nothing here rebuilds elements that already exist. The buttons a person just pressed must stay in the page,
 * or keyboard and screen-reader users lose their place on every tap. Steppers, lines and cards are
 * updated in place, found by basket key; a line is created when its key first appears and removed when it empties.
 */

/** The current basket. basket.js never edits a basket, so this variable is replaced, never mutated */
let basket = emptyBasket();

/** @type {ReadonlyMap<string, SizeInfo>} */
let sizes = new Map();
/** Keys in menu order, so a new summary line lands in the right place */
let keyOrder = /** @type {string[]} */ ([]);

/** The catalogue row (size line with its stepper) for each key
 * @type {Map<string, Element>} */
const rows = new Map();
/** The keys that belong to each product card, to give the card its ring
 * @type {Map<Element, string[]>} */
const cardKeys = new Map();
/** The summary line for each key that is in the basket
 * @type {Map<string, HTMLElement>} */
const lineElements = new Map();

/** True while #resumo is on screen: the bottom bar would only repeat it */
let summaryOnScreen = false;

/** @type {ReturnType<typeof findElements>} */
let ui;

function findElements() {
  /**
   * @param {string} selector
   * @returns {HTMLElement}
   */
  const find = (selector) => mustFind(document, selector);
  return {
    products: find('#products'),
    linesList: find('#summary-lines'),
    lineTemplate: /** @type {HTMLTemplateElement} */ (find('#line-template')),
    summary: find('#resumo'),
    summaryTitle: find('#summary-title'),
    summaryCount: find('#summary-count'),
    summaryEmpty: find('.summary__empty'),
    summaryDetails: find('.summary__details'),
    summaryTotal: find('#summary-total'),
    bar: find('#basket-bar'),
    barLink: find('#bar-link'),
    barTotal: find('#bar-total'),
    barCount: find('#bar-count'),
    barUnit: find('#bar-unit'),
    status: find('#order-status'),
    send: find('#send'),
    sendHint: find('#send-hint'),
    radios: /** @type {HTMLInputElement[]} */ ([...document.querySelectorAll('input[name="recebimento"]')]),
    dateInput: /** @type {HTMLInputElement} */ (find('#data')),
  };
}

/**
 * Starts the order builder on the cards that renderCatalogue() already drew.
 * @param {ReadonlyArray<LiveProduct>} products   in the order the cards are shown
 */
export function startOrderBuilder(products) {
  ui = findElements();
  sizes = indexSizes(products);
  keyOrder = [...sizes.keys()];

  for (const row of ui.products.querySelectorAll('.size[data-key]')) {
    const key = /** @type {HTMLElement} */ (row).dataset.key ?? '';
    rows.set(key, row);
    const card = row.closest('.product');
    if (card) cardKeys.set(card, [...(cardKeys.get(card) ?? []), key]);
  }

  ui.products.addEventListener('click', handleStepperClick);
  ui.linesList.addEventListener('click', handleStepperClick);
  ui.barLink.addEventListener('click', () => ui.summaryTitle.focus({ preventScroll: true }));

  watchSummary();
  startDetailsForm();
  renderTotals();
}

/* ============================================
   Quantities
   ============================================ */

/** @param {Event} event */
function handleStepperClick(event) {
  const button = event.target instanceof Element ? event.target.closest('.stepper__button') : null;
  if (!(button instanceof HTMLElement)) return;
  // aria-disabled instead of disabled keeps focus on the button at 0 and at the limit, so ignore its clicks here
  if (button.getAttribute('aria-disabled') === 'true') return;

  const key = button.closest('[data-key]')?.getAttribute('data-key');
  if (!key || !sizes.has(key)) return;

  basket = changeQuantity(basket, key, button.dataset.action === 'plus' ? 1 : -1);
  renderKey(key);
  renderTotals();
  announce(key);
}

/**
 * Brings the stepper, card ring and summary line for one key up to date
 * @param {string} key
 */
function renderKey(key) {
  const quantity = quantityOf(basket, key);

  const row = rows.get(key);
  if (row) {
    const stepper = mustFind(row, '.stepper');
    setStepper(stepper, quantity);
    stepper.classList.toggle('stepper--active', quantity > 0);
    const card = row.closest('.product');
    const keys = card ? cardKeys.get(card) : undefined;
    if (card && keys) card.classList.toggle('product--selected', keys.some((k) => quantityOf(basket, k) > 0));
  }

  renderLine(key, quantity);
}

/**
 * @param {Element} stepper
 * @param {number} quantity
 */
function setStepper(stepper, quantity) {
  mustFind(stepper, '.stepper__value').textContent = String(quantity);
  mustFind(stepper, '[data-action="minus"]').setAttribute('aria-disabled', String(quantity === 0));
  mustFind(stepper, '[data-action="plus"]').setAttribute('aria-disabled', String(quantity >= MAX_QUANTITY));
}

/* ============================================
   Summary lines
   ============================================ */

/**
 * @param {string} key
 * @param {number} quantity
 */
function renderLine(key, quantity) {
  const existing = lineElements.get(key);
  if (quantity === 0) {
    if (existing) removeLine(key, existing);
    return;
  }

  const line = existing ?? createLine(key);
  setStepper(mustFind(line, '.stepper'), quantity);
  const size = sizes.get(key);
  if (size) mustFind(line, '.line__price').textContent = formatPrice(size.pence * quantity);
}

/**
 * @param {string} key
 * @returns {HTMLElement}
 */
function createLine(key) {
  const size = /** @type {SizeInfo} */ (sizes.get(key));
  const line = /** @type {HTMLElement} */ (mustFind(/** @type {DocumentFragment} */ (ui.lineTemplate.content.cloneNode(true)), '.line'));
  line.dataset.key = key;
  mustFind(line, '.line__name').textContent = size.name;
  mustFind(line, '.line__size').textContent = size.sizeLabel;
  mustFind(line, '[data-action="plus"]').setAttribute('aria-label', `Mais ${size.name}, ${size.sizeLabel}`);
  mustFind(line, '[data-action="minus"]').setAttribute('aria-label', `Menos ${size.name}, ${size.sizeLabel}`);

  // Menu order: go before the first later key that already has a line
  const laterLine = keyOrder
    .slice(keyOrder.indexOf(key) + 1)
    .map((later) => lineElements.get(later))
    .find(Boolean);
  ui.linesList.insertBefore(line, laterLine ?? null);
  lineElements.set(key, line);
  return line;
}

/**
 * Removes an emptied line. If the person was on one of its buttons, focus moves to the same button on the
 * next line, else the previous line, else the summary title. Otherwise focus would fall back to the page top.
 * @param {string} key
 * @param {HTMLElement} line
 */
function removeLine(key, line) {
  const active = document.activeElement;
  const hadFocus = active instanceof HTMLElement && line.contains(active);
  const action = active instanceof HTMLElement ? active.dataset.action : undefined;
  const neighbour = line.nextElementSibling ?? line.previousElementSibling;

  line.remove();
  lineElements.delete(key);

  if (!hadFocus) return;
  const sameButton = action ? neighbour?.querySelector(`[data-action="${action}"]`) : null;
  /** @type {HTMLElement} */ (sameButton ?? ui.summaryTitle).focus();
}

/* ============================================
   Totals, bar and announcements
   ============================================ */

function renderTotals() {
  const lines = orderLines(basket, sizes);
  const total = formatPrice(totalPence(lines));
  const count = itemCount(basket);
  const hasItems = count > 0;

  ui.summaryTotal.textContent = total;
  ui.barTotal.textContent = total;

  ui.summaryCount.textContent = itemsLabel(count);
  ui.summaryCount.hidden = !hasItems;
  ui.linesList.hidden = !hasItems;
  ui.summaryEmpty.hidden = hasItems;
  ui.summaryDetails.hidden = !hasItems;

  ui.barCount.textContent = String(count);
  ui.barUnit.textContent = count === 1 ? ' item' : ' itens';

  ui.send.setAttribute('aria-disabled', String(!hasItems));
  ui.sendHint.hidden = hasItems;
  // A hidden element can still be read as the button's description, so only point at the hint while it shows
  if (hasItems) ui.send.removeAttribute('aria-describedby');
  else ui.send.setAttribute('aria-describedby', ui.sendHint.id);

  renderBar();
}

/** The bar slides up once the basket has something, and steps aside while the summary itself is showing */
function renderBar() {
  ui.bar.classList.toggle('basket-bar--visible', itemCount(basket) > 0 && !summaryOnScreen);
}

function watchSummary() {
  if (!('IntersectionObserver' in window)) return;
  new IntersectionObserver((entries) => {
    summaryOnScreen = entries.some((entry) => entry.isIntersecting);
    renderBar();
  }).observe(ui.summary);
}

/**
 * Tells screen readers what the tap did. The status element is in index.html from the start.
 * @param {string} key
 */
function announce(key) {
  const size = /** @type {SizeInfo} */ (sizes.get(key));
  const quantity = quantityOf(basket, key);
  const what = `${size.name}, ${size.sizeLabel}: ${quantity} no pedido.`;
  const after =
    itemCount(basket) === 0
      ? 'Seu pedido está vazio.'
      : `Total estimado: ${formatPrice(totalPence(orderLines(basket, sizes)))}.`;
  ui.status.textContent = `${what} ${after}`;
}

/* ============================================
   Collection or delivery, and the date
   ============================================ */

/**
 * One field that can be wrong: the controls that get aria-invalid, the element that shows the red outline
 * (a modifier class, since BEM has no tag or parent selectors), the error text, and the rule.
 * @typedef {object} Field
 * @property {HTMLElement[]} controls
 * @property {Element} marker
 * @property {string} markerClass
 * @property {HTMLElement} error
 * @property {() => string | undefined} check   the error message, or undefined when the field is fine
 */

/** @type {Field[]} */
let fields = [];

function earliest() {
  return earliestDate(new Date(), MIN_NOTICE_DAYS);
}

function startDetailsForm() {
  // The picker greys out earlier days. Typing can still get past it, so dateError() checks too
  ui.dateInput.min = toInputValue(earliest());

  fields = [
    {
      controls: ui.radios,
      marker: mustFind(document, '.choice'),
      markerClass: 'choice--invalid',
      error: mustFind(document, '#recebimento-error'),
      check: () => methodError(ui.radios.find((radio) => radio.checked)?.value ?? ''),
    },
    {
      controls: [ui.dateInput],
      marker: ui.dateInput,
      markerClass: 'date-input--invalid',
      error: mustFind(document, '#data-error'),
      check: () => dateError(ui.dateInput.value, earliest()),
    },
  ];

  // An error that is showing updates, or goes away, the moment the field changes
  for (const field of fields) {
    for (const control of field.controls) {
      control.addEventListener('input', () => recheck(field));
      control.addEventListener('change', () => recheck(field));
    }
  }

  ui.send.addEventListener('click', handleSend);
}

/** @param {Field} field */
function recheck(field) {
  if (!field.error.hidden) showResult(field, field.check());
}

/**
 * @param {Field} field
 * @param {string | undefined} message
 */
function showResult(field, message) {
  const invalid = message !== undefined;
  field.error.hidden = !invalid;
  // The text has its own span, so setting it doesn't wipe the icon
  mustFind(field.error, '.field__error-text').textContent = message ?? '';
  field.marker.classList.toggle(field.markerClass, invalid);
  for (const control of field.controls) {
    if (invalid) {
      control.setAttribute('aria-invalid', 'true');
      control.setAttribute('aria-describedby', field.error.id);
    } else {
      control.removeAttribute('aria-invalid');
      control.removeAttribute('aria-describedby');
    }
  }
}

/**
 * Focuses a field and brings the whole field, label and error, into view.
 * Plain focus() scrolls the control only as far as the browser likes, and on short desktop screens that
 * can leave it under the sticky send button. preventScroll plus scrollIntoView honours the slip's scroll-padding.
 * @param {Field} field
 */
function revealField(field) {
  const control = field.controls[0];
  control.focus({ preventScroll: true });
  (control.closest('.field') ?? control).scrollIntoView({ block: 'nearest' });
}

function handleSend() {
  // The button looks disabled and its hint says why; nothing to check yet
  if (itemCount(basket) === 0) return;

  ui.dateInput.min = toInputValue(earliest());

  /** @type {Field | undefined} */
  let firstInvalid;
  for (const field of fields) {
    const message = field.check();
    showResult(field, message);
    if (message && !firstInvalid) firstInvalid = field;
  }

  if (firstInvalid) {
    revealField(firstInvalid);
    return;
  }

  // Stage 4: build the WhatsApp message and open it from here
}
