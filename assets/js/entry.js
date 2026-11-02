'use strict';

(() => {
  const dialog = document.querySelector('#entryDialog');
  const portal = document.querySelector('#entryPortal');
  const replay = document.querySelector('#entryReplay');
  if (!dialog || !portal || typeof dialog.showModal !== 'function') return;

  const SEEN_KEY = 'argent-entry-seen-v1';
  const HOVER_DURATION = 1200;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let leaving = false;
  let hoverFrame = 0;
  let pointerFrame = 0;
  let finishTimer = 0;
  let pointerX = .5;
  let pointerY = .42;
  let returnFocus = null;

  function resetHover() {
    cancelAnimationFrame(hoverFrame);
    hoverFrame = 0;
    portal.style.setProperty('--entry-progress', '0');
    portal.classList.remove('is-hovering');
    document.querySelector('#entryStatus').textContent = '';
  }

  function finishEntry() {
    if (!dialog.open) return;
    clearTimeout(finishTimer);
    dialog.close();
    document.body.classList.remove('entry-open');
    dialog.classList.remove('is-leaving');
    leaving = false;
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (_) {}
    const target = returnFocus || document.querySelector('.hero .btn');
    if (target) target.focus({ preventScroll: true });
    returnFocus = null;
    window.dispatchEvent(new CustomEvent('argent:entered'));
  }

  function enterSite(event) {
    if (event) event.preventDefault();
    if (!dialog.open || leaving) return;
    leaving = true;
    resetHover();
    document.body.classList.add('entry-reveal');
    if (reducedMotion.matches) { finishEntry(); return; }
    dialog.classList.add('is-leaving');
    // The timer also completes entry when an animation is interrupted by the browser.
    finishTimer = setTimeout(finishEntry, 1050);
  }

  function showEntry(fromReplay = false) {
    if (dialog.open) return;
    leaving = false;
    resetHover();
    returnFocus = fromReplay ? replay : null;
    document.body.classList.remove('entry-reveal');
    dialog.classList.remove('is-leaving');
    dialog.style.setProperty('--pointer-x', '50%');
    dialog.style.setProperty('--pointer-y', '42%');
    dialog.style.setProperty('--drift-x', '0px');
    dialog.style.setProperty('--drift-y', '0px');
    dialog.showModal();
    document.body.classList.add('entry-open');
    portal.focus({ preventScroll: true });
  }

  portal.addEventListener('pointerenter', event => {
    if (leaving || !dialog.open || event.pointerType !== 'mouse' || !hoverPointer.matches || reducedMotion.matches) return;
    resetHover();
    const started = performance.now();
    portal.classList.add('is-hovering');
    document.querySelector('#entryStatus').textContent = 'Giriş açılıyor. İptal etmek için imleci uzaklaştırın.';
    function progress(now) {
      const value = Math.min((now - started) / HOVER_DURATION, 1);
      portal.style.setProperty('--entry-progress', String(value));
      if (value >= 1) enterSite();
      else hoverFrame = requestAnimationFrame(progress);
    }
    hoverFrame = requestAnimationFrame(progress);
  });
  portal.addEventListener('pointerleave', resetHover);
  portal.addEventListener('pointercancel', resetHover);
  portal.addEventListener('blur', resetHover);
  portal.addEventListener('click', enterSite);
  document.querySelectorAll('[data-enter-site]').forEach(control => control.addEventListener('click', enterSite));
  replay?.addEventListener('click', () => showEntry(true));
  dialog.addEventListener('cancel', event => { event.preventDefault(); enterSite(); });
  dialog.addEventListener('animationend', event => {
    if (event.target === dialog && event.animationName === 'entry-curtain-open') finishEntry();
  });
  dialog.addEventListener('close', () => {
    resetHover();
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    document.body.classList.remove('entry-open');
  });

  dialog.addEventListener('pointermove', event => {
    if (leaving || reducedMotion.matches || event.pointerType !== 'mouse') return;
    pointerX = Math.min(Math.max(event.clientX / Math.max(window.innerWidth, 1), 0), 1);
    pointerY = Math.min(Math.max(event.clientY / Math.max(window.innerHeight, 1), 0), 1);
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      dialog.style.setProperty('--pointer-x', `${(pointerX * 100).toFixed(2)}%`);
      dialog.style.setProperty('--pointer-y', `${(pointerY * 100).toFixed(2)}%`);
      dialog.style.setProperty('--drift-x', `${((pointerX - .5) * -16).toFixed(2)}px`);
      dialog.style.setProperty('--drift-y', `${((pointerY - .5) * -12).toFixed(2)}px`);
      pointerFrame = 0;
    });
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetHover(); });
  window.addEventListener('blur', resetHover);
  reducedMotion.addEventListener('change', () => { resetHover(); if (leaving) finishEntry(); });
  hoverPointer.addEventListener('change', resetHover);

  let seen = false;
  try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch (_) {}
  // Shared products and section links must reach their target directly.
  if (!window.location.hash && !seen) showEntry();
})();
