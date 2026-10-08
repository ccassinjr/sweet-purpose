// @ts-check

/**
 * Everything about the collection or delivery choice and the preferred date.
 * Dates are built from local parts: toISOString() is UTC and can be a day off.
 */

/**
 * @param {Date} today
 * @param {number} noticeDays
 * @returns {Date}   midnight, local time
 */
export function earliestDate(today, noticeDays) {
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + noticeDays);
}

/**
 * The yyyy-mm-dd text a date input uses for its value and min
 * @param {Date} date
 * @returns {string}
 */
export function toInputValue(date) {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * @param {string} value   what a date input holds
 * @returns {Date | null}  null for empty, half-typed or impossible dates
 */
export function parseInputValue(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  // 31 February rolls over into March; refuse it instead of quietly moving the day
  const rolledOver = date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day;
  return rolledOver ? null : date;
}

const longDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

/**
 * @param {Date} date
 * @returns {string}   'sexta-feira, 9 de outubro'
 */
export function formatLongDate(date) {
  return longDate.format(date);
}

/**
 * @param {string} method   the checked radio's value, or '' when none is checked
 * @returns {string | undefined}
 */
export function methodError(method) {
  return method === 'retirada' || method === 'entrega' ? undefined : 'Escolha retirada ou entrega.';
}

/**
 * The date input's min only limits the picker, and people can still type an earlier date, so check it here too.
 * @param {string} dateValue
 * @param {Date} earliest
 * @returns {string | undefined}
 */
export function dateError(dateValue, earliest) {
  if (dateValue === '') return 'Escolha uma data.';
  const date = parseInputValue(dateValue);
  if (!date || date < earliest) return `Escolha uma data a partir de ${formatLongDate(earliest)}.`;
  return undefined;
}
