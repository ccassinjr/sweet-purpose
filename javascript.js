// @ts-check
import { startOrderBuilder } from './js/basket-ui.js';
import { menuProducts, renderCatalogue, showCatalogueError } from './js/order-ui.js';

// Set first, so the gallery only hides its photos (CSS: .js .reveal) once this module is running
// and startReveals() can show them again. If the module never loads, nothing stays hidden.
document.documentElement.classList.add('js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const yearEl = document.getElementById('js-year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/** Fades in the gallery photos as they scroll into view. The hero fades in with CSS alone, and the order section never reveals */
function startReveals() {
  const revealEls = document.querySelectorAll('.reveal');
  const revealAll = () => revealEls.forEach((el) => el.classList.add('reveal--visible'));

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealAll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
}

// Reveals first: if the catalogue throws, the gallery must still show
startReveals();

try {
  renderCatalogue();
  startOrderBuilder(menuProducts());
} catch (error) {
  // One bad product, or a missing element, must not leave dead steppers: say so, and point to WhatsApp
  console.error('Could not draw the catalogue', error);
  showCatalogueError();
}
