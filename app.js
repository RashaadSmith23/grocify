(function () {
  'use strict';

  const STORAGE_KEY = 'grocify_items';
  const INIT_KEY = 'grocify_initialized';
  let items = [];
  let currentFilter = 'all';
  let currentCategory = 'all';
  let currentSearch = '';
  let sortAsc = true;
  let pendingAction = null;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const addForm = $('#addForm');
  const itemInput = $('#itemInput');
  const qtyInput = $('#qtyInput');
  const categorySelect = $('#categorySelect');
  const groceryList = $('#groceryList');
  const emptyState = $('#emptyState');
  const totalCount = $('#totalCount');
  const purchasedCount = $('#purchasedCount');
  const listTitle = $('#listTitle');
  const searchInput = $('#searchInput');
  const clearSearchBtn = $('#clearSearchBtn');
  const clearPurchasedBtn = $('#clearPurchasedBtn');
  const downloadBtn = $('#downloadBtn');
  const sortBtn = $('#sortBtn');
  const imageToggleBtn = $('#imageToggleBtn');
  const addImageRow = $('#addImageRow');
  const imageUrlInput = $('#imageUrlInput');
  const fileInput = $('#fileInput');
  const imagePreview = $('#imagePreview');
  const previewImg = $('#previewImg');
  const clearImageBtn = $('#clearImageBtn');

  let pendingImage = '';

  const modalOverlay = $('#confirmModal');
  const modalTitle = $('#modalTitle');
  const modalMessage = $('#modalMessage');
  const modalConfirm = $('#modalConfirm');
  const modalCancel = $('#modalCancel');

  function loadItems() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      items = data ? JSON.parse(data) : [];
    } catch {
      items = [];
    }
  }

  function saveItems() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function getDefaultItems() {
    const defaults = [
      { name: 'Milk', qty: 1, category: 'Dairy' },
      { name: 'Bread', qty: 1, category: 'Bakery' },
      { name: 'Eggs', qty: 12, category: 'Dairy' },
      { name: 'Apples', qty: 4, category: 'Produce' },
      { name: 'Chicken Breast', qty: 2, category: 'Meat' },
    ];
    const now = Date.now();
    return defaults.map((d, i) => ({
      id: generateId(),
      name: d.name,
      qty: d.qty,
      category: d.category,
      purchased: false,
      createdAt: now + i * 1000,
    }));
  }

  function getFilteredItems() {
    return items.filter((item) => {
      if (currentFilter === 'active' && item.purchased) return false;
      if (currentFilter === 'purchased' && !item.purchased) return false;
      if (currentCategory !== 'all' && item.category !== currentCategory) return false;
      if (currentSearch) {
        const q = currentSearch.toLowerCase();
        if (!item.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }

  function getStats() {
    const total = items.length;
    const purchased = items.filter((i) => i.purchased).length;
    return { total, purchased };
  }

  function formatDate(ts) {
    const d = new Date(ts);
    const now = new Date();
    const opts = { month: 'short', day: 'numeric' };
    if (d.getFullYear() === now.getFullYear()) {
      return d.toLocaleDateString('en-US', opts);
    }
    return d.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  }

  function render() {
    const filtered = getFilteredItems();

    const label =
      currentFilter === 'all'
        ? 'All Items'
        : currentFilter === 'active'
          ? 'Active Items'
          : 'Purchased Items';
    listTitle.textContent = currentCategory !== 'all' ? `${label} — ${currentCategory}` : label;

    const stats = getStats();
    totalCount.textContent = stats.total;
    purchasedCount.textContent = stats.purchased;

    updateFilterTabs();
    updateCategoryTags();
    updateClearSearch();

    if (filtered.length === 0) {
      groceryList.innerHTML = '';
      emptyState.style.display = 'flex';
      emptyState.querySelector('h3').textContent =
        currentSearch
          ? 'No matches found'
          : items.length === 0
            ? 'Your list is empty'
            : 'No items in this view';
      emptyState.querySelector('p').textContent =
        currentSearch
          ? 'Try a different search term.'
          : items.length === 0
            ? 'Add your first grocery item above!'
            : 'Try switching filters.';
      return;
    }

    emptyState.style.display = 'none';

    const sorted = [...filtered].sort((a, b) => {
      if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
      const cmp = a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
      return sortAsc ? cmp : -cmp;
    });

    groceryList.innerHTML = sorted
      .map(
        (item) => `
      <div class="item-card ${item.purchased ? 'purchased' : ''}" data-id="${item.id}">
        ${ item.image ? `<div class="item-thumb" data-action="view-image"><img src="${escapeHtml(item.image)}" alt=""></div>` : '' }
        <div class="item-checkbox ${item.purchased ? 'checked' : ''}" data-action="toggle"></div>
        <div class="item-info">
          <div class="item-name">${escapeHtml(item.name)}</div>
          <div class="item-meta">
            <span class="item-category">${escapeHtml(item.category)}</span>
            <span class="item-qty">Qty: ${item.qty}</span>
            <span class="item-date">${formatDate(item.createdAt)}</span>
          </div>
        </div>
        <div class="item-actions">
          ${ item.image ? `<button class="btn-item" data-action="remove-image" title="Remove image">&#128247;</button>` : '' }
          <button class="btn-item delete" data-action="delete" title="Remove item">&times;</button>
        </div>
      </div>
    `
      )
      .join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function addItem(name, qty, category, image) {
    const trimmed = name.trim();
    if (!trimmed) return false;

    const existing = items.find(
      (i) => i.name.toLowerCase() === trimmed.toLowerCase() && !i.purchased
    );
    if (existing) {
      existing.qty += qty;
      if (existing.qty > 99) existing.qty = 99;
      if (image && !existing.image) existing.image = image;
      saveItems();
      render();
      return true;
    }

    items.push({
      id: generateId(),
      name: trimmed,
      qty: Math.min(qty, 99),
      category: category || 'Other',
      image: image || '',
      purchased: false,
      createdAt: Date.now(),
    });
    saveItems();
    render();
    return true;
  }

  function toggleItem(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    item.purchased = !item.purchased;
    saveItems();
    render();
  }

  function deleteItem(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    showConfirm({
      title: 'Remove Item',
      message: `Remove <strong>"${escapeHtml(item.name)}"</strong> from your list?`,
      confirmText: 'Remove',
      confirmClass: 'btn-danger-modal',
      onConfirm: () => {
        items = items.filter((i) => i.id !== id);
        saveItems();
        render();
      }
    });
  }

  function removeItemImage(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    item.image = '';
    saveItems();
    render();
  }

  function clearPurchased() {
    const purchasedItems = items.filter((i) => i.purchased);
    if (purchasedItems.length === 0) return;
    showConfirm({
      title: 'Clear Bought Items',
      message: `Remove <strong>${purchasedItems.length}</strong> purchased item${purchasedItems.length > 1 ? 's' : ''} from your list?`,
      confirmText: 'Clear All',
      confirmClass: 'btn-danger-modal',
      onConfirm: () => {
        items = items.filter((i) => !i.purchased);
        saveItems();
        render();
      }
    });
  }

  function downloadList() {
    if (items.length === 0) {
      alert('Your list is empty. Add some items first!');
      return;
    }
    const activeItems = items.filter((i) => !i.purchased);
    const purchasedItems = items.filter((i) => i.purchased);
    let text = '═══════════════════════════════════════\n';
    text += '         GROCIFY SHOPPING LIST\n';
    text += '═══════════════════════════════════════\n';
    text += `  Generated: ${new Date().toLocaleString()}\n`;
    text += `  Total items: ${items.length}\n`;
    text += '───────────────────────────────────────\n\n';
    if (activeItems.length > 0) {
      text += '  TO BUY:\n';
      text += '  ─────────────────────────\n';
      const grouped = {};
      activeItems.forEach((item) => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
      });
      Object.keys(grouped).sort().forEach((cat) => {
        text += `  [${cat}]\n`;
        grouped[cat].forEach((item) => {
          const qty = item.qty > 1 ? ` x${item.qty}` : '';
          text += `    ☐  ${item.name}${qty}\n`;
        });
        text += '\n';
      });
    }
    if (purchasedItems.length > 0) {
      text += '  ALREADY BOUGHT:\n';
      text += '  ─────────────────────────\n';
      purchasedItems.forEach((item) => {
        const qty = item.qty > 1 ? ` x${item.qty}` : '';
        text += `    ☑  ${item.name}${qty}\n`;
      });
      text += '\n';
    }
    text += '═══════════════════════════════════════\n';
    text += '  Happy shopping! 🛒\n';
    text += '═══════════════════════════════════════\n';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `grocify-list-${dateStr}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function setFilter(filter) {
    currentFilter = filter;
    render();
  }

  function setCategory(cat) {
    currentCategory = cat;
    render();
  }

  function setSearch(query) {
    currentSearch = query.trim();
    render();
  }

  function updateFilterTabs() {
    $$('.filter-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.filter === currentFilter);
    });
  }

  function updateCategoryTags() {
    $$('.cat-tag').forEach((tag) => {
      tag.classList.toggle('active', tag.dataset.cat === currentCategory);
    });
  }

  function updateClearSearch() {
    clearSearchBtn.classList.toggle('visible', currentSearch.length > 0);
  }

  function initDefaultItems() {
    const initialized = localStorage.getItem(INIT_KEY);
    if (!initialized && items.length === 0) {
      items = getDefaultItems();
      saveItems();
      localStorage.setItem(INIT_KEY, 'true');
    }
  }

  function setupEventListeners() {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = itemInput.value.trim();
      const qty = parseInt(qtyInput.value, 10) || 1;
      const category = categorySelect.value;
      const image = pendingImage;
      if (name) {
        addItem(name, qty, category, image);
        itemInput.value = '';
        pendingImage = '';
        clearImagePreview();
        itemInput.focus();
      }
    });

    itemInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addForm.dispatchEvent(new Event('submit'));
    });

    imageToggleBtn.addEventListener('click', () => {
      const shown = addImageRow.style.display !== 'none';
      addImageRow.style.display = shown ? 'none' : 'flex';
    });

    imageUrlInput.addEventListener('input', () => {
      const url = imageUrlInput.value.trim();
      if (url) {
        pendingImage = url;
        showImagePreview(url);
      } else if (!fileInput.files.length) {
        pendingImage = '';
        clearImagePreview();
      }
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        pendingImage = e.target.result;
        showImagePreview(pendingImage);
        imageUrlInput.value = '';
      };
      reader.readAsDataURL(file);
    });

    clearImageBtn.addEventListener('click', () => {
      pendingImage = '';
      clearImagePreview();
      imageUrlInput.value = '';
      fileInput.value = '';
    });

    groceryList.addEventListener('click', (e) => {
      const card = e.target.closest('.item-card');
      if (!card) return;
      const id = card.dataset.id;
      const action = e.target.dataset.action;
      if (action === 'toggle') toggleItem(id);
      else if (action === 'delete') deleteItem(id);
      else if (action === 'remove-image') removeItemImage(id);
      else if (action === 'view-image') {
        const img = card.querySelector('.item-thumb img');
        if (img) openLightbox(img.src);
      }
    });

    $$('.filter-tab').forEach((tab) => {
      tab.addEventListener('click', () => setFilter(tab.dataset.filter));
    });

    $$('.cat-tag').forEach((tag) => {
      tag.addEventListener('click', () => setCategory(tag.dataset.cat));
    });

    searchInput.addEventListener('input', () => setSearch(searchInput.value));

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      setSearch('');
      searchInput.focus();
    });

    clearPurchasedBtn.addEventListener('click', clearPurchased);

    downloadBtn.addEventListener('click', downloadList);

    sortBtn.addEventListener('click', () => {
      sortAsc = !sortAsc;
      sortBtn.innerHTML = sortAsc ? '&#8595; Sort' : '&#8593; Sort';
      render();
    });
  }

  function showImagePreview(src) {
    previewImg.src = src;
    imagePreview.style.display = 'flex';
  }

  function clearImagePreview() {
    previewImg.src = '';
    imagePreview.style.display = 'none';
  }

  function openLightbox(src) {
    const lightbox = $('#lightbox');
    const img = $('#lightboxImg');
    img.src = src;
    lightbox.classList.add('open');
  }

  function closeLightbox() {
    const lightbox = $('#lightbox');
    lightbox.classList.remove('open');
    $('#lightboxImg').src = '';
  }

  function showConfirm({ title, message, confirmText, confirmClass, onConfirm }) {
    modalTitle.textContent = title;
    modalMessage.innerHTML = message;
    modalConfirm.textContent = confirmText || 'Confirm';
    modalConfirm.className = 'modal-btn modal-confirm ' + (confirmClass || '');
    pendingAction = onConfirm;
    modalOverlay.classList.add('open');
    modalConfirm.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    pendingAction = null;
  }

  function init() {
    loadItems();
    initDefaultItems();
    render();
    setupEventListeners();

    const lightbox = $('#lightbox');
    lightbox.addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);

    modalConfirm.addEventListener('click', () => {
      if (pendingAction) pendingAction();
      closeModal();
    });
    modalCancel.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
        closeModal();
      }
      if (e.key === 'Enter' && modalOverlay.classList.contains('open')) {
        if (pendingAction) pendingAction();
        closeModal();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();