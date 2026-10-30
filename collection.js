(() => {
  'use strict';

  const bouquets = [
    {
      id: 'f1', title: 'Rosa bonito', category: 'delicados', image: 'ramo-rosa.jpg',
      description: 'Una inspiración suave y romántica para decir mucho con un detalle bonito.'
    },
    {
      id: 'f2', title: 'Un día de colores', category: 'coloridos', image: 'ramo-color.jpg',
      description: 'Colores alegres y una composición llena de vida para acompañar un momento especial.'
    },
    {
      id: 'f3', title: 'Te quiero, y mucho', category: 'romanticos', image: 'ramo-romantico.jpg',
      description: 'Una idea de estilo clásico para dedicar cariño con un gesto que se recuerda.'
    },
    {
      id: 'f4', title: 'Cariño en flor', category: 'delicados', image: 'ramo-lirios.jpg',
      description: 'Una propuesta delicada y luminosa para convertir lo cotidiano en un día especial.'
    }
  ];
  const categoryLabels = { delicados: 'Delicados', coloridos: 'Coloridos', romanticos: 'Románticos' };
  const byId = new Map(bouquets.map(bouquet => [bouquet.id, bouquet]));
  const storageKey = 'ivanna-demo-favorites-v1';
  const summaryOf = bouquet => ({ id: bouquet.id, title: bouquet.title, category: bouquet.category });
  const svgNamespace = 'http://www.w3.org/2000/svg';

  function initialize() {
    const grid = document.getElementById('collection-grid');
    if (!grid) return;
    const count = document.getElementById('collection-count');
    const filters = [...document.querySelectorAll('[data-style-filter]')];
    const bouquetDialog = document.getElementById('bouquet-dialog');
    const detailBody = document.getElementById('bouquet-detail-body');
    const favoritesDialog = document.getElementById('favorites-dialog');
    const favoritesList = document.getElementById('favorites-list');
    const favoritesEmpty = document.getElementById('favorites-empty');
    const toast = document.getElementById('floral-toast');
    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const favorites = new Set();
    const openers = new WeakMap();
    let activeFilter = 'all';
    let toastTimer;

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(saved)) saved.filter(id => typeof id === 'string' && byId.has(id)).slice(0, 4).forEach(id => favorites.add(id));
    } catch { /* Favorites continue to work in memory when browser storage is unavailable. */ }

    const element = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    };
    function heartIcon(className = 'col-heart-icon') {
      const icon = document.createElementNS(svgNamespace, 'svg');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('class', className);
      icon.setAttribute('aria-hidden', 'true');
      icon.setAttribute('focusable', 'false');
      const path = document.createElementNS(svgNamespace, 'path');
      path.setAttribute('d', 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z');
      icon.append(path);
      return icon;
    }
    function photoFor(bouquet, className) {
      const image = element('img', className);
      image.src = `./assets/${bouquet.image}`;
      image.alt = `Imagen de inspiración para el estilo ${bouquet.title}`;
      image.width = 1200;
      image.height = 1500;
      image.loading = 'lazy';
      image.decoding = 'async';
      return image;
    }
    const getFavorites = () => [...favorites].map(id => summaryOf(byId.get(id)));
    function persistAndNotify() {
      try { localStorage.setItem(storageKey, JSON.stringify([...favorites])); } catch { /* Preserve the current in-memory choice. */ }
      document.dispatchEvent(new CustomEvent('ivanna:favorites', { detail: { items: getFavorites() } }));
    }
    function announce(message) {
      if (!toast) return;
      clearTimeout(toastTimer);
      toast.textContent = message;
      toast.classList.add('col-toast-visible');
      toastTimer = setTimeout(() => toast.classList.remove('col-toast-visible'), 3800);
    }
    function heartBurst(button) {
      if (motionQuery.matches || !button) return;
      const rect = button.getBoundingClientRect();
      const burst = element('span', 'col-heart-burst');
      burst.setAttribute('aria-hidden', 'true');
      burst.style.left = `${rect.left + rect.width / 2}px`;
      burst.style.top = `${rect.top + rect.height / 2}px`;
      for (let index = 0; index < 6; index += 1) {
        const petal = element('span', 'col-burst-heart');
        const angle = -Math.PI + (index / 5) * Math.PI;
        const distance = 40 + Math.random() * 30;
        petal.style.setProperty('--col-dx', `${Math.cos(angle) * distance}px`);
        petal.style.setProperty('--col-dy', `${Math.sin(angle) * distance - 20}px`);
        petal.style.setProperty('--col-rotation', `${(Math.random() - 0.5) * 65}deg`);
        petal.style.setProperty('--col-delay', `${index * 20}ms`);
        petal.append(heartIcon());
        burst.append(petal);
      }
      (button.closest('dialog') || document.body).append(burst);
      setTimeout(() => burst.remove(), 1050);
    }
    function syncFavoriteButtons() {
      document.querySelectorAll('[data-col-favorite]').forEach(button => {
        const bouquet = byId.get(button.dataset.colFavorite);
        if (!bouquet) return;
        const saved = favorites.has(bouquet.id);
        button.classList.toggle('col-is-favorite', saved);
        button.setAttribute('aria-pressed', String(saved));
        button.setAttribute('aria-label', `${saved ? 'Quitar' : 'Guardar'} ${bouquet.title} ${saved ? 'de' : 'en'} mis favoritos`);
        const text = button.querySelector('[data-col-favorite-text]');
        if (text) text.textContent = saved ? 'Guardado con cariño' : 'Guardar mi inspiración';
      });
      document.querySelectorAll('[data-favorite-count]').forEach(badge => { badge.textContent = String(favorites.size); });
      document.querySelectorAll('[data-open-favorites]').forEach(button => {
        button.setAttribute('aria-label', `Ver mis favoritos, ${favorites.size} ${favorites.size === 1 ? 'inspiración guardada' : 'inspiraciones guardadas'}`);
      });
    }
    function favoriteButtonFor(bouquet, detailed = false) {
      const button = element('button', detailed ? 'col-detail-save' : 'col-save');
      button.type = 'button';
      button.dataset.colFavorite = bouquet.id;
      button.append(heartIcon());
      if (detailed) {
        const text = element('span', '', 'Guardar mi inspiración');
        text.dataset.colFavoriteText = '';
        button.append(text);
      }
      return button;
    }
    function toggleFavorite(id, button) {
      const bouquet = byId.get(id);
      if (!bouquet) return;
      const removed = favorites.has(id);
      if (removed) favorites.delete(id);
      else { favorites.add(id); heartBurst(button); }
      syncFavoriteButtons();
      renderFavorites();
      persistAndNotify();
      announce(removed ? `${bouquet.title} se quitó de tus favoritos.` : `${bouquet.title} se guardó entre tus favoritos.`);
    }
    function openDialog(dialog, opener) {
      if (!dialog || dialog.open) return;
      openers.set(dialog, opener || document.activeElement);
      dialog.showModal();
    }
    function closeDialog(dialog, restoreFocus = true) {
      if (!dialog) return;
      const opener = openers.get(dialog);
      openers.delete(dialog);
      dialog.close();
      if (restoreFocus && opener instanceof HTMLElement && opener.isConnected && opener.getClientRects().length) opener.focus({ preventScroll: true });
    }
    function chooseBouquet(id) {
      const bouquet = byId.get(id);
      if (!bouquet) return;
      if (bouquetDialog?.open) closeDialog(bouquetDialog, false);
      if (favoritesDialog?.open) closeDialog(favoritesDialog, false);
      document.dispatchEvent(new CustomEvent('ivanna:choose', { detail: summaryOf(bouquet) }));
    }
    function showDetails(id, opener) {
      const bouquet = byId.get(id);
      if (!bouquet || !bouquetDialog || !detailBody) return;
      let returnFocusTo = opener;
      if (favoritesDialog?.open) {
        returnFocusTo = openers.get(favoritesDialog) || opener;
        closeDialog(favoritesDialog, false);
      }
      const visual = element('div', 'col-detail-visual');
      visual.append(photoFor(bouquet, 'col-detail-image'));
      const content = element('div', 'col-detail-content');
      const eyebrow = element('p', 'col-eyebrow', 'Una idea para inspirarte');
      const title = element('h2', 'col-detail-title', bouquet.title);
      title.id = 'col-bouquet-title';
      const category = element('p', 'col-detail-category', categoryLabels[bouquet.category]);
      const description = element('p', 'col-detail-description', bouquet.description);
      const invitation = element('p', 'col-detail-invitation', 'Lleva este estilo a tu consulta y cuéntanos cómo te gustaría personalizarlo.');
      const choose = element('button', 'col-choose', 'Quiero este estilo');
      choose.type = 'button';
      choose.dataset.colChoose = bouquet.id;
      choose.append(heartIcon());
      const note = element('p', 'col-detail-note', 'Imagen de inspiración. Diseño, flores y precio se acuerdan por WhatsApp.');
      content.append(eyebrow, title, category, description, invitation, choose, favoriteButtonFor(bouquet, true), note);
      detailBody.replaceChildren(visual, content);
      bouquetDialog.setAttribute('aria-labelledby', title.id);
      syncFavoriteButtons();
      openDialog(bouquetDialog, returnFocusTo);
    }
    function cardFor(bouquet, index) {
      const article = element('article', 'col-card');
      article.style.setProperty('--col-order', String(index));
      const visual = element('div', 'col-card-visual');
      const imageButton = element('button', 'col-image-button');
      imageButton.type = 'button';
      imageButton.dataset.colDetails = bouquet.id;
      imageButton.setAttribute('aria-label', `Ver la inspiración ${bouquet.title}`);
      imageButton.append(photoFor(bouquet, 'col-image'));
      visual.append(imageButton, favoriteButtonFor(bouquet));
      const copy = element('div', 'col-card-copy');
      const category = element('p', 'col-category', categoryLabels[bouquet.category]);
      const title = element('h3', 'col-title');
      const titleButton = element('button', 'col-title-button', bouquet.title);
      titleButton.type = 'button';
      titleButton.dataset.colDetails = bouquet.id;
      title.append(titleButton);
      const description = element('p', 'col-description', bouquet.description);
      const cta = element('button', 'col-card-cta', 'Cotizar mi detalle');
      cta.type = 'button';
      cta.dataset.colDetails = bouquet.id;
      cta.setAttribute('aria-label', `Ver ${bouquet.title} para cotizar mi detalle`);
      const arrow = element('span', '', '↗');
      arrow.setAttribute('aria-hidden', 'true');
      cta.append(arrow);
      copy.append(category, title, description, cta);
      article.append(visual, copy);
      return article;
    }
    function renderCollection() {
      const visible = bouquets.filter(bouquet => activeFilter === 'all' || bouquet.category === activeFilter);
      const fragment = document.createDocumentFragment();
      visible.forEach((bouquet, index) => fragment.append(cardFor(bouquet, index)));
      grid.replaceChildren(fragment);
      if (count) count.textContent = `${visible.length} ${visible.length === 1 ? 'inspiración para ti' : 'inspiraciones para ti'}`;
      filters.forEach(button => {
        const active = button.dataset.styleFilter === activeFilter;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('col-filter-active', active);
      });
      syncFavoriteButtons();
    }
    function renderFavorites() {
      if (!favoritesList) return;
      const fragment = document.createDocumentFragment();
      [...favorites].forEach(id => {
        const bouquet = byId.get(id);
        const row = element('div', 'col-favorite-row');
        const preview = element('button', 'col-favorite-preview');
        preview.type = 'button';
        preview.dataset.colDetails = id;
        preview.setAttribute('aria-label', `Ver ${bouquet.title}`);
        preview.append(photoFor(bouquet, 'col-favorite-image'));
        const copy = element('div', 'col-favorite-copy');
        copy.append(element('h3', '', bouquet.title), element('p', '', categoryLabels[bouquet.category]));
        const choose = element('button', 'col-favorite-choose', 'Elegir este estilo');
        choose.type = 'button';
        choose.dataset.colChoose = id;
        copy.append(choose);
        const remove = element('button', 'col-favorite-remove', 'Quitar');
        remove.type = 'button';
        remove.dataset.colRemove = id;
        remove.setAttribute('aria-label', `Quitar ${bouquet.title} de mis favoritos`);
        row.append(preview, copy, remove);
        fragment.append(row);
      });
      favoritesList.replaceChildren(fragment);
      if (favoritesEmpty) favoritesEmpty.hidden = favorites.size > 0;
    }

    filters.forEach(button => button.addEventListener('click', () => {
      const requested = button.dataset.styleFilter;
      activeFilter = Object.hasOwn(categoryLabels, requested) ? requested : 'all';
      renderCollection();
    }));
    document.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      const details = event.target.closest('[data-col-details]');
      if (details) { showDetails(details.dataset.colDetails, details); return; }
      const favorite = event.target.closest('[data-col-favorite]');
      if (favorite) { toggleFavorite(favorite.dataset.colFavorite, favorite); return; }
      const choose = event.target.closest('[data-col-choose]');
      if (choose) { chooseBouquet(choose.dataset.colChoose); return; }
      const remove = event.target.closest('[data-col-remove]');
      if (remove) {
        const index = [...favoritesList.querySelectorAll('[data-col-remove]')].indexOf(remove);
        toggleFavorite(remove.dataset.colRemove, null);
        const remaining = [...favoritesList.querySelectorAll('[data-col-remove]')];
        (remaining[Math.min(index, remaining.length - 1)] || favoritesDialog?.querySelector('[data-close-modal]'))?.focus();
        return;
      }
      const openFavorites = event.target.closest('[data-open-favorites]');
      if (openFavorites) { renderFavorites(); openDialog(favoritesDialog, openFavorites); return; }
      const close = event.target.closest('[data-close-modal]');
      if (close) closeDialog(close.closest('dialog'));
    });
    [bouquetDialog, favoritesDialog].filter(Boolean).forEach(dialog => {
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
      });
      dialog.addEventListener('cancel', () => {
        const opener = openers.get(dialog);
        openers.delete(dialog);
        if (opener instanceof HTMLElement && opener.isConnected && opener.getClientRects().length) requestAnimationFrame(() => opener.focus({ preventScroll: true }));
      });
    });
    window.ivannaCollection = Object.freeze({
      getFavorites,
      clearFavorites() { favorites.clear(); syncFavoriteButtons(); renderFavorites(); persistAndNotify(); }
    });
    renderCollection();
    renderFavorites();
    setTimeout(persistAndNotify, 0);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
