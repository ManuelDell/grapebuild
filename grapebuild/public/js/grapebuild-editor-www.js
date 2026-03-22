(function () {
  'use strict';

  var editor = null;
  var pageName = null;
  var autoSaveTimer = null;
  var pagePublished = false;
  var maintenanceMode = false;

  /* ===== URL param ===== */
  function getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  }

  /* ===== API ===== */
  function api(method, args) {
    return _gbFetch('grapebuild.api.page_api.' + method, args);
  }

  /* ===== Status ===== */
  function setStatus(msg, color) {
    var el = document.getElementById('gb-status');
    el.textContent = msg;
    el.style.color = color || '#6b7280';
  }

  /* ===== Init GrapesJS ===== */
  function initEditor(gjsData) {
    editor = grapesjs.init({
      container: '#gjs',
      height: '100%',
      width: 'auto',
      storageManager: false,
      fromElement: false,

      deviceManager: {
        devices: [
          { name: 'Desktop', width: '' },
          { name: 'Tablet', width: '768px', widthMedia: '992px' },
          { name: 'Mobile', width: '320px', widthMedia: '480px' },
        ],
      },

      panels: { defaults: [] },

      blockManager: {
        appendTo: '#gb-blocks',
        blocks: [
          {
            id: 'section',
            label: 'Abschnitt',
            category: 'Layout',
            content: '<section class="gb-section" style="padding:60px 20px;"><div class="gb-container" style="max-width:960px;margin:0 auto;"><h2 style="margin-bottom:16px;">Überschrift</h2><p>Text hier eingeben…</p></div></section>',
          },
          {
            id: 'columns-2',
            label: '2 Spalten',
            category: 'Layout',
            content: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:32px 20px;"><div style="padding:16px;background:#f9fafb;border-radius:8px;">Spalte 1</div><div style="padding:16px;background:#f9fafb;border-radius:8px;">Spalte 2</div></div>',
          },
          {
            id: 'columns-3',
            label: '3 Spalten',
            category: 'Layout',
            content: '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;padding:32px 20px;"><div style="padding:16px;background:#f9fafb;border-radius:8px;">1</div><div style="padding:16px;background:#f9fafb;border-radius:8px;">2</div><div style="padding:16px;background:#f9fafb;border-radius:8px;">3</div></div>',
          },
          {
            id: 'text',
            label: 'Text',
            category: 'Inhalt',
            content: { type: 'text', content: 'Doppelklick zum Bearbeiten', style: { padding: '16px' } },
          },
          {
            id: 'heading',
            label: 'Überschrift',
            category: 'Inhalt',
            content: '<h1 style="font-size:2.5rem;font-weight:700;line-height:1.2;padding:16px;">Überschrift</h1>',
          },
          {
            id: 'image',
            label: 'Bild',
            category: 'Inhalt',
            select: true,
            content: { type: 'image', style: { width: '100%', height: 'auto' } },
            activate: true,
          },
          {
            id: 'button',
            label: 'Button',
            category: 'Inhalt',
            content: '<a href="#" style="display:inline-block;padding:12px 28px;background:#F2AF0D;color:#000;font-weight:600;border-radius:6px;text-decoration:none;">Button</a>',
          },
          {
            id: 'hero',
            label: 'Hero',
            category: 'Vorlagen',
            content: '<section style="padding:100px 20px;background:linear-gradient(135deg,#F2AF0D22,#ffffff);text-align:center;"><h1 style="font-size:3rem;font-weight:800;margin-bottom:16px;">Headline</h1><p style="font-size:1.2rem;color:#6b7280;margin-bottom:32px;max-width:600px;margin-left:auto;margin-right:auto;">Beschreibungstext hier</p><a href="#" style="display:inline-block;padding:14px 32px;background:#F2AF0D;color:#000;font-weight:700;border-radius:8px;text-decoration:none;font-size:1rem;">Jetzt starten</a></section>',
          },
          {
            id: 'features-3',
            label: '3 Feature Cards',
            category: 'Vorlagen',
            content: '<section style="padding:60px 20px;"><h2 style="text-align:center;margin-bottom:40px;">Unsere Leistungen</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:960px;margin:0 auto;"><div style="padding:28px;background:#fff;border:1px solid #e2e6ea;border-radius:8px;text-align:center;"><div style="font-size:2rem;margin-bottom:12px;">⭐</div><h3 style="margin-bottom:8px;">Feature 1</h3><p style="color:#6b7280;font-size:.9rem;">Beschreibung</p></div><div style="padding:28px;background:#fff;border:1px solid #e2e6ea;border-radius:8px;text-align:center;"><div style="font-size:2rem;margin-bottom:12px;">🚀</div><h3 style="margin-bottom:8px;">Feature 2</h3><p style="color:#6b7280;font-size:.9rem;">Beschreibung</p></div><div style="padding:28px;background:#fff;border:1px solid #e2e6ea;border-radius:8px;text-align:center;"><div style="font-size:2rem;margin-bottom:12px;">💡</div><h3 style="margin-bottom:8px;">Feature 3</h3><p style="color:#6b7280;font-size:.9rem;">Beschreibung</p></div></div></section>',
          },
        ],
      },

      canvas: {
        styles: [
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
        ],
        scripts: [],
      },

      styleManager: {
        appendTo: '#gb-styles',
        sectors: [
          {
            name: 'Dimension',
            open: false,
            properties: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
          },
          {
            name: 'Typografie',
            open: false,
            properties: ['font-family', 'font-size', 'font-weight', 'color', 'line-height', 'text-align'],
          },
          {
            name: 'Hintergrund',
            open: false,
            properties: ['background-color', 'background-image'],
          },
          {
            name: 'Rahmen',
            open: false,
            properties: ['border', 'border-radius', 'box-shadow'],
          },
        ],
      },

      layerManager: { appendTo: '#gb-layers' },
      traitManager: { appendTo: '#gb-traits' },
    });

    // Load saved data
    if (gjsData && gjsData !== '{}') {
      try {
        editor.loadProjectData(JSON.parse(gjsData));
      } catch (e) {
        console.warn('GrapeBuild: Fehler beim Laden der Editor-Daten', e);
      }
    }

    // Auto-save every 60s
    editor.on('change:changesCount', function () {
      clearTimeout(autoSaveTimer);
      setStatus('Ungespeichert', '#b45309');
      autoSaveTimer = setTimeout(triggerSave, 60000);
    });

    setStatus('Bereit');
  }

  /* ===== Load page ===== */
  function loadPage() {
    pageName = getParam('page');
    if (!pageName) {
      window.location.href = '/grapebuild/hub';
      return;
    }

    api('load_page', { page_name: pageName })
      .then(function (data) {
        document.getElementById('gb-page-title').textContent = data.page_title;
        document.title = 'GrapeBuild — ' + data.page_title;
        pagePublished = !!data.published;
        maintenanceMode = !!data.maintenance_mode;
        updateToolbarState();
        initEditor(data.gjs_data);
      })
      .catch(function (e) {
        document.getElementById('gb-page-title').textContent = 'Fehler: ' + e.message;
      });
  }

  /* ===== Save ===== */
  function triggerSave() {
    if (!editor) return Promise.resolve();
    setStatus('Speichere…');
    var data = JSON.stringify(editor.getProjectData());
    return api('save_page', { page_name: pageName, gjs_data: data })
      .then(function () {
        setStatus('Gespeichert ✓', '#16a34a');
        setTimeout(function () { setStatus('Bereit'); }, 3000);
      })
      .catch(function (e) {
        setStatus('Fehler beim Speichern', '#ef4444');
        console.error(e);
      });
  }

  /* ===== Publish ===== */
  function triggerPublish() {
    if (!editor) return;
    setStatus('Publiziere…');
    var html = editor.getHtml();
    var css = editor.getCss();
    var data = JSON.stringify(editor.getProjectData());

    api('publish_page', {
      page_name: pageName,
      gjs_html: html,
      gjs_css: css,
      gjs_data: data,
    }).then(function (result) {
      pagePublished = true;
      updateToolbarState();
      setStatus('Publiziert ✓', '#16a34a');
      showPublishModal(result);
      setTimeout(function () { setStatus('Bereit'); }, 5000);
    }).catch(function (e) {
      setStatus('Fehler: ' + e.message, '#ef4444');
      alert('Fehler beim Publizieren: ' + e.message);
    });
  }

  /* ===== Toolbar state ===== */
  function updateToolbarState() {
    var unpublishBtn = document.getElementById('gb-btn-unpublish');
    var maintenanceBtn = document.getElementById('gb-btn-maintenance');
    unpublishBtn.style.display = pagePublished ? '' : 'none';
    if (maintenanceMode) {
      maintenanceBtn.classList.remove('gb-btn--ghost');
      maintenanceBtn.classList.add('gb-btn--warning');
      maintenanceBtn.title = 'Wartungsmodus aktiv – klicken zum Deaktivieren';
    } else {
      maintenanceBtn.classList.remove('gb-btn--warning');
      maintenanceBtn.classList.add('gb-btn--ghost');
      maintenanceBtn.title = 'Wartungsmodus aktivieren';
    }
  }

  /* ===== Unpublish ===== */
  function triggerUnpublish() {
    if (!confirm('Seite depublizieren? Sie wird unter der URL nicht mehr erreichbar sein.')) return;
    setStatus('Depubliziere…');
    api('unpublish_page', { page_name: pageName })
      .then(function () {
        pagePublished = false;
        updateToolbarState();
        setStatus('Depubliziert ✓', '#6b7280');
        setTimeout(function () { setStatus('Bereit'); }, 3000);
      })
      .catch(function (e) {
        setStatus('Fehler', '#ef4444');
        alert('Fehler: ' + e.message);
      });
  }

  /* ===== Maintenance mode ===== */
  function triggerMaintenance() {
    var next = maintenanceMode ? 0 : 1;
    var label = next ? 'aktivieren' : 'deaktivieren';
    if (!confirm('Wartungsmodus ' + label + '?')) return;
    api('set_maintenance_mode', { page_name: pageName, enabled: next })
      .then(function (result) {
        maintenanceMode = !!result.maintenance_mode;
        updateToolbarState();
        setStatus('Wartungsmodus ' + (maintenanceMode ? 'aktiv' : 'inaktiv'), '#6b7280');
        setTimeout(function () { setStatus('Bereit'); }, 3000);
      })
      .catch(function (e) {
        setStatus('Fehler', '#ef4444');
        alert('Fehler: ' + e.message);
      });
  }

  /* ===== Publish Modal ===== */
  function showPublishModal(result) {
    var modal = document.getElementById('gb-publish-modal');
    var urlWrap = document.getElementById('gb-publish-url-wrap');
    var urlLink = document.getElementById('gb-publish-url');
    var previewBtn = document.getElementById('gb-publish-preview-btn');
    var warningsList = document.getElementById('gb-publish-warnings');

    if (result.url) {
      urlWrap.style.display = '';
      urlLink.href = result.url;
      urlLink.textContent = result.url;
      previewBtn.style.display = '';
      previewBtn.href = result.url;
    } else {
      urlWrap.style.display = 'none';
      previewBtn.style.display = 'none';
    }

    warningsList.innerHTML = '';
    (result.warnings || []).forEach(function (w) {
      var li = document.createElement('li');
      li.textContent = w;
      warningsList.appendChild(li);
    });

    modal.removeAttribute('hidden');
  }

  /* ===== Device switching ===== */
  document.getElementById('gb-device-btns').addEventListener('click', function (e) {
    var btn = e.target.closest('.gb-device-btn');
    if (!btn || !editor) return;
    var device = btn.dataset.device;
    var map = { desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile' };
    editor.setDevice(map[device] || 'Desktop');
    document.querySelectorAll('.gb-device-btn').forEach(function (b) {
      b.classList.remove('gb-device-btn--active');
    });
    btn.classList.add('gb-device-btn--active');
  });

  /* ===== Button events ===== */
  document.getElementById('gb-btn-save').addEventListener('click', triggerSave);
  document.getElementById('gb-btn-publish').addEventListener('click', triggerPublish);
  document.getElementById('gb-btn-unpublish').addEventListener('click', triggerUnpublish);
  document.getElementById('gb-btn-maintenance').addEventListener('click', triggerMaintenance);

  document.getElementById('gb-publish-modal-close').addEventListener('click', function () {
    document.getElementById('gb-publish-modal').setAttribute('hidden', '');
  });
  document.getElementById('gb-publish-ok').addEventListener('click', function () {
    document.getElementById('gb-publish-modal').setAttribute('hidden', '');
  });

  // Ctrl+S / Cmd+S
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      triggerSave();
    }
  });

  /* ===== Panel tab switching ===== */
  document.querySelectorAll('.gb-ptab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.dataset.tab;
      var panelId  = btn.dataset.panel;
      var panel    = document.getElementById(panelId);
      if (!panel) return;
      // deactivate all tabs in this panel
      panel.querySelectorAll('.gb-ptab').forEach(function (b) {
        b.classList.remove('gb-ptab--active');
      });
      btn.classList.add('gb-ptab--active');
      // show/hide panes
      panel.querySelectorAll('.gb-pane').forEach(function (pane) {
        pane.style.display = pane.id === targetId ? '' : 'none';
      });
    });
  });

  /* ===== Init ===== */
  loadPage();

})();
