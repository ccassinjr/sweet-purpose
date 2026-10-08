// @ts-check
import { totalPence } from './basket.js';
import { formatLongDate } from './details.js';
import { formatPrice } from './money.js';

/** @typedef {import('./basket.js').OrderLine} OrderLine */

/**
 * The message and the wa.me link. Pure functions: the page passes in what the customer chose.
 * The wording is waiting on the client's sign-off, so every sentence lives in buildMessage() and nowhere else.
 */

/**
 * Saturday and Sunday are masculine in Portuguese ("no sábado"), the other weekdays feminine ("na segunda-feira")
 * @param {Date} date
 * @returns {string}   'no sábado, 17 de outubro' or 'na segunda-feira, 19 de outubro'
 */
export function datePhrase(date) {
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  return `${weekend ? 'no' : 'na'} ${formatLongDate(date)}`;
}

/**
 * @param {object} order
 * @param {ReadonlyArray<OrderLine>} order.lines
 * @param {'retirada' | 'entrega'} order.method
 * @param {Date} order.date
 * @returns {string}
 */
export function buildMessage({ lines, method, date }) {
  const items = lines.map((line) => `- ${line.quantity}x ${line.name} (${line.sizeLabel}): ${formatPrice(line.linePence)}`);
  // Delivery is priced on WhatsApp, so only Entrega gets the reminder next to the total
  const deliveryNote = method === 'entrega' ? ' (entrega não inclusa)' : '';

  return [
    'Olá, Sweet Purpose! Quero fazer um pedido:',
    '',
    ...items,
    '',
    `*Total estimado: ${formatPrice(totalPence(lines))}*${deliveryNote}`,
    '',
    `Prefiro *${method}* ${datePhrase(date)}.`,
    '',
    'Aguardo a confirmação e os dados para pagamento.',
  ].join('\n');
}

/**
 * @param {string} number    international format without a plus sign, like WHATSAPP_NUMBER
 * @param {string} message
 * @returns {string}
 */
export function buildLink(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
