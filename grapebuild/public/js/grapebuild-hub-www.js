(function () {
  'use strict';

  var allPages = [];
  var currentFilter = 'all';

  /* ===== API ===== */
  function api(method, args) {
    return _gbFetch('grapebuild.api.page_api.' + method, args);
  }

  /* ===== Render ===== */
  function escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtDate(str) {
    if (!str) return '';
    var d = new Date(str);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function renderTable() {
    var q = (document.getElementById('gb-search').value || '').toLowerCase();
    var filtered = allPages.filter(function (p) {
      var matchFilter =
        currentFilter === 'all' ||
        (currentFilter === 'published' && p.published) ||
        (currentFilter === 'draft' && !p.published);
      var matchSearch =
        !q ||
        (p.page_title || '').toLowerCase().includes(q) ||
        (p.slug || '').toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });

    var tbody = document.getElementById('gb-pages-body');

    if (!filtered.length) {
      tbody.innerHTML =
        '<tr class="gb-table__empty"><td colspan="6">Keine Seiten gefunden</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(function (p) {
      var badge = p.published
        ? '<span class="gb-badge gb-badge--live"><svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>Live</span>'
        : '<span class="gb-badge gb-badge--draft">Entwurf</span>';
      var preview = p.published
        ? '<a href="/' + escape(p.slug) + '" target="_blank" class="gb-btn gb-btn--ghost gb-btn--sm" title="Vorschau"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>'
        : '';
      return '<tr>'
        + '<td>' + escape(p.page_title) + '</td>'
        + '<td><span class="gb-slug-code">' + escape(p.slug) + '</span></td>'
        + '<td>' + escape(p.page_type || 'Page') + '</td>'
        + '<td>' + badge + '</td>'
        + '<td>' + fmtDate(p.modified) + '</td>'
        + '<td><div class="gb-row-actions">'
        + '<button class="gb-btn gb-btn--ghost gb-btn--sm gb-btn-edit" data-name="' + escape(p.name) + '" title="Bearbeiten"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Bearbeiten</button>'
        + preview
        + '</div></td>'
        + '</tr>';
    }).join('');
  }

  function loadPages() {
    api('list_pages').then(function (pages) {
      allPages = pages || [];
      renderTable();
    }).catch(function (e) {
      document.getElementById('gb-pages-body').innerHTML =
        '<tr class="gb-table__empty"><td colspan="6">Fehler beim Laden: ' + escape(e.message) + '</td></tr>';
    });
  }

  /* ===== Modal ===== */
  function showModal() {
    document.getElementById('gb-modal-backdrop').removeAttribute('hidden');
    document.getElementById('modal-title').focus();
  }
  function hideModal() {
    document.getElementById('gb-modal-backdrop').setAttribute('hidden', '');
    document.getElementById('modal-title').value = '';
    document.getElementById('modal-slug').value = '';
  }

  function slugify(str) {
    return str.toLowerCase()
      .replace(/[äáàâ]/g, 'a').replace(/[öóòô]/g, 'o').replace(/[üúùû]/g, 'u')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /* ===== Events ===== */
  document.getElementById('gb-btn-new').addEventListener('click', showModal);
  document.getElementById('gb-modal-close').addEventListener('click', hideModal);
  document.getElementById('gb-modal-cancel').addEventListener('click', hideModal);

  document.getElementById('modal-title').addEventListener('input', function () {
    var slugField = document.getElementById('modal-slug');
    if (!slugField._manual) {
      slugField.value = slugify(this.value);
    }
  });
  document.getElementById('modal-slug').addEventListener('input', function () {
    this._manual = !!this.value;
  });

  document.getElementById('gb-modal-create').addEventListener('click', function () {
    var title = document.getElementById('modal-title').value.trim();
    if (!title) {
      document.getElementById('modal-title').focus();
      return;
    }
    var slug = document.getElementById('modal-slug').value.trim();
    var type = document.getElementById('modal-type').value;
    var btn = this;
    btn.disabled = true;
    btn.textContent = 'Erstelle…';

    api('create_page', { page_title: title, slug: slug, page_type: type })
      .then(function (result) {
        hideModal();
        window.location.href = '/grapebuild/editor?page=' + encodeURIComponent(result.name);
      })
      .catch(function (e) {
        btn.disabled = false;
        btn.textContent = 'Erstellen & Bearbeiten';
        alert('Fehler: ' + e.message);
      });
  });

  // Close modal on backdrop click
  document.getElementById('gb-modal-backdrop').addEventListener('click', function (e) {
    if (e.target === this) hideModal();
  });

  // Keyboard
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hideModal();
  });

  // Filter tabs
  document.getElementById('gb-filters').addEventListener('click', function (e) {
    var btn = e.target.closest('.gb-filter-tab');
    if (!btn) return;
    document.querySelectorAll('.gb-filter-tab').forEach(function (b) {
      b.classList.remove('gb-filter-tab--active');
    });
    btn.classList.add('gb-filter-tab--active');
    currentFilter = btn.dataset.filter;
    renderTable();
  });

  // Search
  document.getElementById('gb-search').addEventListener('input', function () {
    renderTable();
  });

  // Edit button (delegated)
  document.getElementById('gb-pages-body').addEventListener('click', function (e) {
    var btn = e.target.closest('.gb-btn-edit');
    if (!btn) return;
    window.location.href = '/grapebuild/editor?page=' + encodeURIComponent(btn.dataset.name);
  });

  /* ===== Init ===== */
  loadPages();

})();
