'use strict';

// Örnek ürün verileri. Gerçek katalog daha sonra API üzerinden yüklenebilir.
const products = [
  { id: 1, title: 'Luna Gümüş Yüzük', category: 'Yüzük', code: 'GMS-1001', stone: 'Zirkon', purity: '925 Ayar', weight: '3,8 gr', tag: 'YENİ', date: 8, image: 'assets/images/luna.jpg' },
  { id: 2, title: 'Aurelia İnce Kolye', category: 'Kolye', code: 'GMS-1002', stone: 'Taşsız', purity: '925 Ayar', weight: '5,2 gr', tag: 'İMZA PARÇA', date: 7, image: 'assets/images/aurelia.jpg' },
  { id: 3, title: 'Serene Gümüş Bileklik', category: 'Bileklik', code: 'GMS-1003', stone: 'Taşsız', purity: '925 Ayar', weight: '6,1 gr', tag: '', date: 6, image: 'assets/images/serene.jpg' },
  { id: 4, title: 'Celeste Işıltılı Küpe', category: 'Küpe', code: 'GMS-1004', stone: 'Zirkon', purity: '925 Ayar', weight: '2,6 gr', tag: 'YENİ', date: 5, image: 'assets/images/celeste.jpg' },
  { id: 5, title: 'Nova Minimal Yüzük', category: 'Yüzük', code: 'GMS-1005', stone: 'Taşsız', purity: '925 Ayar', weight: '3,2 gr', tag: '', date: 4, image: 'assets/images/nova.jpg' },
  { id: 6, title: 'Mira Taşlı Kolye', category: 'Kolye', code: 'GMS-1006', stone: 'Doğal Taş', purity: '925 Ayar', weight: '4,7 gr', tag: 'İMZA PARÇA', date: 3, image: 'assets/images/mira.jpg' },
  { id: 7, title: 'Vela Zarif Bileklik', category: 'Bileklik', code: 'GMS-1007', stone: 'Zirkon', purity: '925 Ayar', weight: '7,0 gr', tag: '', date: 2, image: 'assets/images/vela.jpg' },
  { id: 8, title: 'Étoile Gümüş Küpe', category: 'Küpe', code: 'GMS-1008', stone: 'Doğal Taş', purity: '925 Ayar', weight: '3,1 gr', tag: '', date: 1, image: 'assets/images/etoile.jpg' }
];

// Gerçek uluslararası WhatsApp numarasını (905XXXXXXXXX) ve e-postayı buraya ekleyin.
const WHATSAPP_NUMBER = '';
const CONTACT_EMAIL = 'info@example.com';
const FAVORITES_KEY = 'argent-favorites-v1';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const state = { category: 'Tümü', stone: 'Tümü', query: '', sort: 'featured', favoritesOnly: false };
let favorites = new Set();
let toastTimer;
let previousHash = '';
let activeProduct = null;

try {
  const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  if (Array.isArray(saved)) favorites = new Set(saved.filter(id => products.some(p => p.id === id)));
} catch (_) { /* Tarayıcı depolaması kapalıysa favoriler bu oturumda çalışır. */ }

function notify(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2800);
}

function favoriteButton(product, modal = false) {
  const selected = favorites.has(product.id);
  return `<button type="button" class="${modal ? 'modal-favorite' : 'icon-button product-favorite'}" data-favorite="${product.id}" aria-label="${product.title} ${selected ? 'favorilerden çıkar' : 'favorilere ekle'}" aria-pressed="${selected}">${icon('heart')}${modal ? `<span>${selected ? 'Favorilerinizde' : 'Favorilere ekle'}</span>` : ''}</button>`;
}

function syncFavorites() {
  $('#favoriteCount').textContent = favorites.size;
  $('#favoriteCount').hidden = favorites.size === 0;
  $('#favoritesToggle').setAttribute('aria-pressed', String(state.favoritesOnly));
  $('#favoritesToggle').setAttribute('aria-label', state.favoritesOnly ? 'Tüm koleksiyonu göster' : `Favorilerimi göster (${favorites.size} ürün)`);
  $$('[data-favorite]').forEach(button => {
    const product = products.find(p => p.id === Number(button.dataset.favorite));
    const selected = favorites.has(product.id);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${product.title} ${selected ? 'favorilerden çıkar' : 'favorilere ekle'}`);
    const label = button.querySelector('span');
    if (label) label.textContent = selected ? 'Favorilerinizde' : 'Favorilere ekle';
  });
}

function toggleFavorite(id) {
  if (!products.some(p => p.id === id)) return;
  const added = !favorites.has(id);
  if (added) favorites.add(id); else favorites.delete(id);
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites])); } catch (_) {}
  if (state.favoritesOnly) renderProducts();
  syncFavorites();
  notify(added ? 'Bu parça favorilerinize eklendi.' : 'Bu parça favorilerinizden çıkarıldı.');
}

function renderProducts() {
  const query = state.query.trim().toLocaleLowerCase('tr-TR');
  const data = products.filter(product =>
    (state.category === 'Tümü' || product.category === state.category) &&
    (state.stone === 'Tümü' || product.stone === state.stone) &&
    (!state.favoritesOnly || favorites.has(product.id)) &&
    `${product.title} ${product.category} ${product.code} ${product.stone}`.toLocaleLowerCase('tr-TR').includes(query)
  );
  if (state.sort === 'az') data.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
  if (state.sort === 'newest') data.sort((a, b) => b.date - a.date);
  if (state.sort === 'featured') data.sort((a, b) => Number(b.tag === 'İMZA PARÇA') - Number(a.tag === 'İMZA PARÇA') || b.date - a.date);

  $('#productGrid').innerHTML = data.map(product => `<article class="product-card">
    <button type="button" class="product-photo" data-product="${product.id}" aria-label="${product.title} detaylarını gör">
      <img src="${product.image}" alt="${product.title}" width="850" height="1000" loading="lazy">
      ${product.tag ? `<span class="product-tag ${product.tag === 'İMZA PARÇA' ? 'signature' : ''}">${product.tag}</span>` : ''}
      <span class="product-expand" aria-hidden="true">YAKINDAN KEŞFET ${icon('diagonal')}</span>
    </button>${favoriteButton(product)}
    <div class="product-meta"><div class="product-meta-top"><span>${product.category.toLocaleUpperCase('tr-TR')}</span><span>${product.purity.toLocaleUpperCase('tr-TR')} GÜMÜŞ</span></div><h3><button type="button" data-product="${product.id}">${product.title}</button></h3><p>${product.stone} · ${product.code}</p></div>
  </article>`).join('');

  $('#productCount').textContent = `${String(data.length).padStart(2, '0')} PARÇA${state.favoritesOnly ? ' / FAVORİLERİNİZ' : ' / KEŞFETMENİZ İÇİN'}`;
  const empty = $('#emptyMessage');
  empty.hidden = data.length > 0;
  empty.querySelector('h3').textContent = state.favoritesOnly && favorites.size === 0 ? 'İlk favorinizi keşfedin.' : 'Henüz bir eşleşme yok.';
  empty.querySelector('p').textContent = state.favoritesOnly && favorites.size === 0 ? 'Beğendiğiniz parçanın kalbine dokunun; sizin için burada saklayalım.' : 'Farklı bir kelime deneyin veya filtreleri temizleyin.';
  $('#resetFilters').hidden = state.category === 'Tümü' && state.stone === 'Tümü' && !query && !state.favoritesOnly && state.sort === 'featured';
  syncFavorites();
}

function syncTabs() {
  $$('[data-filter]').forEach(button => {
    const selected = button.dataset.filter === state.category;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function resetFilters() {
  Object.assign(state, { category: 'Tümü', stone: 'Tümü', query: '', sort: 'featured', favoritesOnly: false });
  $('#stoneFilter').value = 'Tümü';
  $('#sortSelect').value = 'featured';
  $('#globalSearch').value = '';
  syncTabs();
  renderProducts();
}

function scrollToCollection() {
  $('#koleksiyon').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
}

function setSearch(open, restoreFocus = false) {
  $('#searchStrip').hidden = !open;
  $('#searchToggle').setAttribute('aria-expanded', String(open));
  if (open) { setMenu(false); $('#globalSearch').focus(); }
  else if (restoreFocus) $('#searchToggle').focus();
}

function setMenu(open, restoreFocus = false) {
  $('#mobileNav').hidden = !open;
  $('#menuToggle').setAttribute('aria-expanded', String(open));
  $('#menuToggle').setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  if (open) setSearch(false);
  else if (restoreFocus) $('#menuToggle').focus();
}

$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  state.category = button.dataset.filter;
  syncTabs();
  renderProducts();
}));
$$('[data-category-link]').forEach(link => link.addEventListener('click', () => {
  resetFilters();
  state.category = link.dataset.categoryLink;
  syncTabs();
  renderProducts();
}));
$('#stoneFilter').addEventListener('change', event => { state.stone = event.target.value; renderProducts(); });
$('#sortSelect').addEventListener('change', event => { state.sort = event.target.value; renderProducts(); });
$('#globalSearch').addEventListener('input', event => { state.query = event.target.value; renderProducts(); });
$('#searchToggle').addEventListener('click', () => setSearch($('#searchStrip').hidden));
$('#searchClose').addEventListener('click', () => setSearch(false, true));
$('#searchStrip').addEventListener('submit', event => { event.preventDefault(); setSearch(false); scrollToCollection(); });
$('#menuToggle').addEventListener('click', () => setMenu($('#mobileNav').hidden));
$$('.mobile-nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
$('#resetFilters').addEventListener('click', resetFilters);
$('#emptyReset').addEventListener('click', resetFilters);
$('#favoritesToggle').addEventListener('click', () => {
  const showFavorites = !state.favoritesOnly;
  resetFilters();
  state.favoritesOnly = showFavorites;
  renderProducts();
  setSearch(false);
  setMenu(false);
  scrollToCollection();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (!$('#searchStrip').hidden) setSearch(false, true);
    if (!$('#mobileNav').hidden) setMenu(false, true);
  }
});
window.matchMedia('(min-width: 641px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

const dialog = $('#productDialog');
function productUrl(product) {
  const url = new URL(window.location.href);
  url.hash = `urun-${product.code.toLowerCase()}`;
  return url.href;
}
function openProduct(id, fromLink = false) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  if (!dialog.open) previousHash = fromLink ? '#koleksiyon' : window.location.hash;
  activeProduct = product;
  const message = `Merhaba, ${product.title} (${product.code}) hakkında bilgi almak istiyorum.\n${productUrl(product)}`;
  const contactUrl = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    : `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(product.title + ' hakkında bilgi')}&body=${encodeURIComponent(message)}`;
  $('#modalBody').innerHTML = `<div class="modal-layout"><div class="modal-main-image"><img src="${product.image}" alt="${product.title}" width="850" height="1000"><span class="modal-image-caption">ARGENT / THE SILVER EDIT</span></div><div class="modal-details"><span class="eyebrow">${product.category.toLocaleUpperCase('tr-TR')} / ${product.code}</span><h2 id="modalTitle">${product.title}</h2><p>Günün her anına eşlik eden, yalın çizgisiyle kendi hikâyenizin bir parçası olan bir tasarım.</p><dl class="specs"><div><dt>GÜMÜŞ AYARI</dt><dd>${product.purity}</dd></div><div><dt>TAŞ TÜRÜ</dt><dd>${product.stone}</dd></div><div><dt>AĞIRLIK</dt><dd>${product.weight}</dd></div><div><dt>ÜRÜN KODU</dt><dd>${product.code}</dd></div></dl><a class="btn btn-dark" href="${contactUrl}" ${WHATSAPP_NUMBER ? 'target="_blank" rel="noopener noreferrer"' : ''}>${WHATSAPP_NUMBER ? 'WHATSAPP İLE BİLGİ AL' : 'BU PARÇA HAKKINDA YAZIN'} ${icon('diagonal')}</a><div class="modal-actions">${favoriteButton(product, true)}<button type="button" id="shareProduct">Bağlantıyı kopyala ${icon('diagonal')}</button></div><p class="modal-note">Bu bir örnek koleksiyondur. Görsel, ürün bilgileri ve gramaj temsilidir.${!WHATSAPP_NUMBER && CONTACT_EMAIL === 'info@example.com' ? ' İletişim adresi demo amaçlıdır.' : ''}</p></div></div>`;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  document.body.classList.add('modal-open');
  try { history.replaceState(null, '', productUrl(product)); } catch (_) {}
}

async function copyProductLink() {
  if (!activeProduct) return;
  const url = productUrl(activeProduct);
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
    else {
      const input = document.createElement('textarea');
      input.value = url;
      input.setAttribute('aria-label', 'Ürün bağlantısı');
      input.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      dialog.append(input);
      input.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } finally { input.remove(); }
      if (!copied) throw new Error('Clipboard unavailable');
    }
    const button = $('#shareProduct');
    if (button) button.textContent = 'Bağlantı kopyalandı ✓';
  } catch (_) {
    const button = $('#shareProduct');
    if (button) button.textContent = 'Bağlantı adres çubuğunda';
  }
}

document.addEventListener('click', event => {
  const favorite = event.target.closest('[data-favorite]');
  if (favorite) { toggleFavorite(Number(favorite.dataset.favorite)); return; }
  const product = event.target.closest('[data-product]');
  if (product) { openProduct(Number(product.dataset.product)); return; }
  if (event.target.closest('#shareProduct')) copyProductLink();
});
$('#modalClose').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  activeProduct = null;
  if (window.location.hash.startsWith('#urun-')) {
    try { history.replaceState(null, '', window.location.pathname + window.location.search + previousHash); } catch (_) {}
  }
});
function openFromHash() {
  const product = products.find(item => `#urun-${item.code.toLowerCase()}` === window.location.hash);
  if (product) openProduct(product.id, true);
  else if (dialog.open) dialog.close();
}
window.addEventListener('hashchange', openFromHash);
$('#year').textContent = new Date().getFullYear();
renderProducts();
openFromHash();
