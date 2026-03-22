(function () {
    'use strict';

    async function fetchData(doctype, fields, filters, orderBy, limit) {
        const resp = await fetch('/api/method/grapebuild.api.data_api.get_dynamic_data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doctype, fields, filters, order_by: orderBy, limit }),
        });
        const json = await resp.json();
        return json.message || [];
    }

    function renderTemplate(tpl, item) {
        return tpl.replace(/\{\{(\w+)\}\}/g, function (_, k) {
            return item[k] !== undefined ? String(item[k]) : '';
        });
    }

    async function hydrate() {
        for (const block of document.querySelectorAll('[data-frappe-doctype]')) {
            const doctype = block.dataset.frappeDoctype;
            const fields = (block.dataset.frappeFields || '').split(',').map(function (f) { return f.trim(); });
            const filters = JSON.parse(block.dataset.frappeFilters || '[]');
            const orderBy = block.dataset.frappeOrderBy || 'modified desc';
            const limit = parseInt(block.dataset.frappeLimit || '10');
            const tpl = block.querySelector('[data-frappe-item-template]');
            if (!doctype || !tpl) continue;
            try {
                const items = await fetchData(doctype, fields, filters, orderBy, limit);
                const html = tpl.innerHTML;
                block.innerHTML = '';
                items.forEach(function (item) {
                    const div = document.createElement('div');
                    div.innerHTML = renderTemplate(html, item);
                    if (div.firstElementChild) block.appendChild(div.firstElementChild);
                });
            } catch (e) {
                console.warn('GrapeBuild runtime error:', doctype, e);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hydrate);
    } else {
        hydrate();
    }
})();
