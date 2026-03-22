# GRAPEBUILD — Vollständige Projektspezifikation für Claude Code
> Lies diese Datei vollständig bevor du eine einzige Zeile Code schreibst.
> Diese Datei ist das einzige Source of Truth für das Projekt.

---

## ⚙️ PROJEKT-KONFIGURATION

```
FRAPPE_VERSION    = v16                          ← frappe.qb API, neue Permission-Syntax
BENCH_PATH        = ~/frappe-bench
SITE_NAME         = grapebuild.localhost
APP_NAME          = grapebuild
PYTHON_VERSION    = 3.11+
DEV_ENV           = Lokales Bench (macOS/Linux)
ERPNEXT_COMPAT    = Ja — standalone UND mit ERPNext (KEINE ERPNext-Pflicht-Deps)
```

---

## 🗺️ ROADMAP — MVP ZUERST

```
╔══════════════════════════════════════════════════════════╗
║  MVP  (diese drei Meilensteine = produktiv einsetzbar)  ║
║                                                          ║
║  M0 — Fundament        App, DocTypes, GrapesJS läuft    ║
║  M1 — Öffentliche URLs Renderer, Publish, Live-Seite    ║
║  M4 — DocType-Binding  Dynamic Blocks mit Frappe-Daten  ║
╚══════════════════════════════════════════════════════════╝

POST-MVP (in dieser Reihenfolge nach MVP):
  M2 — Hub Cards + Templates + Site Settings
  M3 — Komponenten-Bibliothek (Drag & Drop Blöcke)
  M5 — Einfacher URL-Importer
  M6 — JS-Integration + Access Control
  M7 — Playwright-Importer + Spider
  M8 — Performance-Polish

WARUM diese Reihenfolge:
  M4 direkt nach M1 weil DocType-Binding das Kern-Differenziator
  ist (kein anderes Frappe-Tool kann das). Danach kommen UX-
  Features (Hub, Templates, Importer) die den Workflow beschleunigen.
```

---

## ⚠️ FRAPPE V16 — WICHTIGE API-UNTERSCHIEDE

```python
# frappe.qb statt frappe.db.sql für neue Queries:
from frappe.query_builder import DocType
Page = DocType("GrapeBuild Page")
result = frappe.qb.from_(Page).select(Page.name, Page.slug).where(
    Page.published == 1
).run(as_dict=True)

# Permission Check v16-Stil:
frappe.has_permission("GrapeBuild Page", "write", throw=True)
# NICHT mehr: frappe.permissions.has_permission(...)

# after_request Hook in v16 — Signatur geändert:
# hooks.py: after_request = ["grapebuild.renderer.page_renderer.add_security_headers"]
# Die Funktion bekommt (response) als Parameter

# Single DocType laden in v16:
doc = frappe.get_cached_doc("GrapeBuild Site Settings")  # gecacht
doc = frappe.get_single("GrapeBuild Site Settings")       # immer frisch

# Frappe v16: bench migrate ist PFLICHT nach DocType-Änderungen
# Kein automatisches Schema-Update mehr beim Restart
```

---

## 🎯 VISION

**GrapeBuild** ist eine Frappe Custom App die GrapesJS als vollwertigen visuellen
Website-Builder in das Frappe-Ökosystem integriert. Ziel: professionelle, schnelle,
SEO-optimierte öffentliche Websites ohne Code — mit echter dynamischer Datenbindung
an Frappe DocTypes.

**Positionierung:**
- Kein Ersatz für Frappe Desk-Seiten
- Ausschließlich für öffentliche Websites (wie diedells.de, ecg-heilbronn.de, owf)
- Frappe als Headless-CMS + GrapesJS als visueller Frontend-Builder
- Entwickler (Manuel) als primärer Nutzer + Redakteure als sekundäre Nutzer
- MIT-Lizenz, Open Source, kommerziell einsetzbar
- **App-unabhängig**: läuft standalone (nur Frappe) UND mit ERPNext
- **Keine ERPNext-DocTypes als Dependency** — nur Standard-Frappe-DocTypes nutzen

---

## 📁 APP-VERZEICHNISSTRUKTUR

```
grapebuild/
├── grapebuild/
│   ├── __init__.py
│   ├── hooks.py                          ← App-Registration, page_renderer, doc_events
│   ├── utils.py                          ← Gemeinsame Hilfsfunktionen
│   │
│   ├── doctype/
│   │   ├── grapebuild_page/              ← Hauptdokument: eine Website-Seite
│   │   │   ├── grapebuild_page.json
│   │   │   ├── grapebuild_page.py
│   │   │   └── grapebuild_page.js
│   │   ├── grapebuild_site_settings/     ← Single DocType: globale Site-Einstellungen
│   │   │   ├── grapebuild_site_settings.json
│   │   │   └── grapebuild_site_settings.py
│   │   ├── grapebuild_block_template/    ← Gespeicherte Nutzer-Komponenten (DB)
│   │   │   ├── grapebuild_block_template.json
│   │   │   └── grapebuild_block_template.py
│   │   └── grapebuild_page_role/         ← Child DocType für Zugangskontrolle
│   │       └── grapebuild_page_role.json
│   │
│   ├── page/
│   │   ├── grapebuild_hub/               ← Frappe Desk Page: Übersicht aller Seiten
│   │   │   ├── grapebuild_hub.json
│   │   │   ├── grapebuild_hub.html
│   │   │   ├── grapebuild_hub.css
│   │   │   └── grapebuild_hub.js
│   │   └── grapebuild_builder/           ← Frappe Desk Page: Der GrapesJS-Editor
│   │       ├── grapebuild_builder.json
│   │       ├── grapebuild_builder.html
│   │       ├── grapebuild_builder.css
│   │       └── grapebuild_builder.js
│   │
│   ├── renderer/
│   │   ├── __init__.py
│   │   ├── page_renderer.py              ← Custom Page Renderer (Kernstück)
│   │   └── cache.py                      ← Cache-Invalidierung
│   │
│   ├── api/
│   │   ├── page_api.py                   ← save, load, publish, list, create
│   │   ├── data_api.py                   ← DocType-Daten für Dynamic Blocks
│   │   ├── component_api.py              ← Komponenten-Bibliothek
│   │   ├── template_api.py               ← Seiten-Vorlagen
│   │   └── import_api.py                 ← URL-Importer (einfach + Playwright)
│   │
│   ├── components/                       ← Dateibasierte Komponenten (Drag & Drop Blöcke)
│   │   ├── _README.md
│   │   ├── hero-section/
│   │   │   ├── hero-section.html
│   │   │   ├── hero-section.css
│   │   │   ├── hero-section.js           ← Optional
│   │   │   ├── preview.png               ← Vorschaubild (optional)
│   │   │   └── meta.json                 ← { label, category, icon, tags }
│   │   ├── site-header/
│   │   ├── site-footer/
│   │   ├── feature-cards/
│   │   ├── team-grid/
│   │   ├── faq-accordion/
│   │   ├── contact-form/
│   │   ├── event-list/                   ← Dynamic Block: OWF-Typ
│   │   └── testimonials/
│   │
│   ├── templates/                        ← Vollständige Seitenvorlagen
│   │   ├── _README.md
│   │   ├── landing-minimal/
│   │   │   ├── template.html
│   │   │   ├── template.css
│   │   │   ├── preview.png
│   │   │   └── meta.json
│   │   ├── church-presence/
│   │   ├── event-registration/
│   │   ├── handwerk-dienstleister/
│   │   └── portfolio/
│   │
│   ├── www/
│   │   ├── sitemap.xml.html              ← Auto-Sitemap
│   │   └── sitemap.xml.py
│   │
│   └── public/
│       ├── js/
│       │   ├── vendor/
│       │   │   └── grapesjs.min.js       ← GrapesJS v1.x
│       │   ├── plugins/
│       │   │   ├── grapesjs-preset-webpage.min.js
│       │   │   ├── grapesjs-blocks-basic.min.js
│       │   │   ├── grapesjs-plugin-forms.min.js
│       │   │   └── grapebuild-plugin.js  ← Eigener GrapesJS-Plugin
│       │   ├── grapebuild-editor.js      ← Editor-Bootstrap
│       │   ├── grapebuild-hub.js         ← Hub-Logik
│       │   └── grapebuild-runtime.js     ← Dynamic-Block-Runtime (öffentliche Seiten)
│       └── css/
│           ├── vendor/grapes.min.css
│           ├── grapebuild-editor.css
│           └── grapebuild-hub.css
│
├── setup.py
├── requirements.txt
├── MANIFEST.in
└── README.md
```

---

## 📦 ABHÄNGIGKEITEN

```
# requirements.txt
nh3>=0.2.14              # HTML-Sanitisierung (NICHT bleach — deprecated!)
Pillow>=10.0.0           # Bildverarbeitung + WebP-Konvertierung
beautifulsoup4>=4.12.0   # HTML-Parsing für Importer
lxml>=4.9.0              # Sicherer BS4-Parser
requests>=2.31.0         # HTTP-Requests (Importer)
playwright>=1.40.0       # Headless Browser (M7, optional)
```

---

## 🗄️ DOCTYPES — VOLLSTÄNDIGE DEFINITION

### GrapeBuild Page
```
Felder:
  page_title        Data, required
  slug              Data, required, unique — URL-Pfad: /meine-seite
  meta_description  Small Text
  meta_keywords     Small Text

  # Editor-Daten (hidden)
  gjs_data          Long Text   — GrapesJS Project JSON (vollständiger Editor-State)
  rendered_html     Long Text   — Pre-gerendertes HTML (beim Publish gesetzt)
  rendered_css      Long Text   — Extrahiertes CSS

  # Publishing
  published         Check
  published_on      Datetime, read-only
  page_type         Select: Page|Landing|Blog|Custom

  # JS (Ebene 4 — nur für privilegierte Rollen sichtbar)
  page_script       Long Text   — Custom JS pro Seite (nur Website Developer)
  page_head_html    Small Text  — Zusätzliches <head> HTML (canonical etc.)

  # Zugang
  access_type       Select: public|password|frappe_login|custom_login
  access_password   Password    — depends_on: access_type == password
  access_roles      Table: GrapeBuild Page Role
  login_page        Link: GrapeBuild Page  — depends_on: access_type != public
  redirect_after_login Link: GrapeBuild Page

  # Meta
  thumbnail         Attach Image   — Vorschaubild im Hub
  canvas_site       Link: GrapeBuild Site Settings
  dynamic_render_mode Select: client_side|server_side|hybrid

Website Generator:
  has_web_view = 0    ← KEIN WebsiteGenerator! Wir nutzen Custom Renderer.
```

### GrapeBuild Site Settings (Single DocType)
```
Tab Allgemein:
  site_name         Data
  base_url          Data           — https://diedells.de
  site_language     Select: de|en|fr|...
  favicon           Attach Image
  logo              Attach Image

Tab Design-Tokens:
  primary_color     Color          — als CSS Custom Property: --color-primary
  secondary_color   Color
  accent_color      Color
  default_font      Data           — Google Fonts Name
  heading_font      Data
  border_radius     Data           — z.B. "8px"

Tab SEO & Analytics:
  meta_description_default Small Text
  google_analytics_id Data
  google_tag_manager  Data
  head_scripts        Long Text    — Beliebiges <head>-HTML (kein Sanitizer)
  body_scripts        Long Text    — Vor </body>

Tab Zugang:
  default_access_type Select: public|frappe_login
  login_page          Link: GrapeBuild Page
  logout_redirect     Data
  allow_registration  Check
  registration_role   Link: Role

Tab Erweitert:
  maintenance_mode    Check
  maintenance_message Small Text
  robots_txt          Long Text
  sitemap_enabled     Check, default: 1
  custom_404_page     Link: GrapeBuild Page
```

### GrapeBuild Block Template
```
  block_name        Data, required
  block_category    Select: Layout|Content|Dynamic|Form|Navigation|Custom
  block_label       Data
  block_icon        Data
  gjs_component     Long Text      — GrapesJS Component JSON
  is_dynamic        Check
  source_doctype    Link: DocType  — depends_on: is_dynamic
  fields_mapping    Long Text      — JSON
  default_filters   Long Text      — JSON
  order_by          Data
  max_records       Int, default:10
  preview_html      Long Text
  is_active         Check, default:1
```

### GrapeBuild Page Role (Child)
```
  parent            Link: GrapeBuild Page
  role              Link: Role
```

---

## 🔧 HOOKS.PY — KRITISCHE KONFIGURATION

```python
app_name = "grapebuild"
app_title = "GrapeBuild"
app_publisher = "Manuel Dell"
app_description = "Visual Website Builder for Frappe"
app_license = "MIT"

# WICHTIGSTE ZEILE: Custom Page Renderer
# Wird VOR allen Standard-Frappe-Renderern geprüft
page_renderer = "grapebuild.renderer.page_renderer.GrapeBuildPageRenderer"

# Cache-Invalidierung bei Änderungen
doc_events = {
    "GrapeBuild Page": {
        "after_save":  "grapebuild.renderer.cache.on_page_change",
        "on_trash":    "grapebuild.renderer.cache.on_page_change",
        "after_insert":"grapebuild.renderer.cache.on_page_change",
    },
    "GrapeBuild Site Settings": {
        "after_save": "grapebuild.renderer.cache.on_settings_change",
    }
}

# Security Headers für öffentliche Seiten
after_request = ["grapebuild.renderer.page_renderer.add_security_headers"]
```

---

## 🔒 SECURITY — ABSOLUTE PFLICHT (nicht verhandelbar)

### HTML-Sanitisierung
```python
# IMMER nh3 verwenden — NIEMALS bleach (deprecated seit 2023)
import nh3

ALLOWED_TAGS = {
    "div","section","article","header","footer","main","nav",
    "h1","h2","h3","h4","h5","h6","p","span","a","img",
    "ul","ol","li","button","table","thead","tbody","tr","th","td",
    "figure","figcaption","picture","source","form","input","select","textarea",
    "blockquote","pre","code","em","strong","br","hr",
}

ALLOWED_ATTRS = {
    "*":     {"class","id","style",
              "data-frappe-doctype","data-frappe-fields","data-frappe-filters",
              "data-frappe-limit","data-frappe-order-by","data-frappe-item-template"},
    "a":     {"href","target","rel","title"},
    "img":   {"src","alt","width","height","loading","fetchpriority","decoding"},
    "input": {"type","name","placeholder","required","value","autocomplete"},
    "form":  {"method","action","data-frappe-submit-to"},
    "source":{"srcset","media","type"},
}

def sanitize_html(html: str) -> str:
    return nh3.clean(html, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS,
                     strip_comments=True)
```

### SSRF-Schutz (URL-Importer)
```python
import ipaddress, socket
from urllib.parse import urlparse

BLOCKED_RANGES = [
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),  # AWS Metadata
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
]

def validate_import_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        frappe.throw(f"URL-Schema '{parsed.scheme}' nicht erlaubt")
    hostname = parsed.hostname
    if hostname in {"localhost", "127.0.0.1", "::1", "0.0.0.0"}:
        frappe.throw("Lokale Adressen nicht erlaubt")
    try:
        ip = ipaddress.ip_address(socket.gethostbyname(hostname))
        for blocked in BLOCKED_RANGES:
            if ip in blocked:
                frappe.throw(f"IP-Bereich {blocked} ist nicht erlaubt")
    except socket.gaierror:
        frappe.throw("Hostname konnte nicht aufgelöst werden")
    return url
```

### CSP Headers
```python
def add_security_headers(response):
    path = frappe.local.request.path if hasattr(frappe.local, "request") else ""
    if _is_public_canvas_page(path):
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https://fonts.gstatic.com; "
            "frame-ancestors 'none'; "
            "base-uri 'self';"
        )
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response
```

---

## 🚀 CUSTOM PAGE RENDERER — KERN-IMPLEMENTIERUNG

```python
# grapebuild/renderer/page_renderer.py
import frappe
from frappe.website.page_renderers.base_renderer import BaseRenderer
from frappe.website.utils import build_response

SKIP_PREFIXES = (
    "/api/", "/assets/", "/files/", "/__",
    "/favicon", "/robots", "/sitemap",
    "/app/", "/desk/", "/login", "/logout",
)

SLUG_CACHE_KEY    = "grapebuild_slugs_v2"
RENDER_CACHE_KEY  = "grapebuild_html_{slug}"

class GrapeBuildPageRenderer(BaseRenderer):

    def can_render(self) -> bool:
        path = self.path.strip("/")
        if not path:
            return False
        raw = "/" + path
        if any(raw.startswith(p) for p in SKIP_PREFIXES):
            return False
        if "." in path.split("/")[-1]:
            return False
        return path in self._get_published_slugs()

    def _get_published_slugs(self) -> set:
        cached = frappe.cache.get_value(SLUG_CACHE_KEY)
        if cached:
            return set(cached)
        pages = frappe.get_all("GrapeBuild Page", fields=["slug"],
                                filters={"published": 1})
        slugs = {p.slug for p in pages}
        frappe.cache.set_value(SLUG_CACHE_KEY, list(slugs), expires_in_sec=120)
        return slugs

    def render(self):
        slug = self.path.strip("/")
        cache_key = RENDER_CACHE_KEY.format(slug=slug)

        # Cache-Hit prüfen
        cached = frappe.cache.get_value(cache_key)
        if cached:
            return build_response(cached)

        try:
            page = frappe.get_doc("GrapeBuild Page", {"slug": slug, "published": 1})
        except frappe.DoesNotExistError:
            frappe.cache.delete_value(cache_key)
            frappe.local.response["status_code"] = 404
            return build_response("<h1>404 – Seite nicht gefunden</h1>")

        # Access Control
        redirect = self._check_access(page)
        if redirect:
            return redirect

        html = self._assemble_html(page)

        # Caching: Dynamic Blocks = kurze TTL
        has_dynamic = "data-frappe-doctype" in (page.rendered_html or "")
        ttl = 60 if has_dynamic else 3600
        frappe.cache.set_value(cache_key, html, expires_in_sec=ttl)

        return build_response(html)

    def _assemble_html(self, page) -> str:
        settings = self._get_site_settings()
        lcp_preload = self._get_lcp_preload(page.rendered_html or "")
        dynamic_runtime = self._get_dynamic_runtime(page)

        return f"""<!DOCTYPE html>
<html lang="{settings.site_language or 'de'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{frappe.utils.escape_html(page.page_title)}</title>
<meta name="description" content="{frappe.utils.escape_html(page.meta_description or '')}">
{lcp_preload}
{self._design_tokens(settings)}
<style id="gb-page-css">{page.rendered_css or ''}</style>
{settings.head_scripts or ''}
{page.page_head_html or ''}
</head>
<body>
{page.rendered_html or ''}
{dynamic_runtime}
{self._page_script(page)}
{settings.body_scripts or ''}
</body>
</html>"""

    def _design_tokens(self, s) -> str:
        return f"""<style>:root{{
--color-primary:{s.primary_color or '#2d6a4f'};
--color-secondary:{s.secondary_color or '#64748b'};
--color-accent:{s.accent_color or '#f59e0b'};
--font-body:'{s.default_font or 'Inter'}',sans-serif;
--font-heading:'{s.heading_font or s.default_font or 'Inter'}',sans-serif;
--border-radius:{s.border_radius or '8px'};
}}</style>"""

    def _get_lcp_preload(self, html: str) -> str:
        """Erstes Bild als LCP-Kandidat mit preload markieren."""
        import re
        m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', html)
        if m:
            src = m.group(1)
            return f'<link rel="preload" as="image" href="{src}" fetchpriority="high">'
        return ""

    def _get_dynamic_runtime(self, page) -> str:
        if "data-frappe-doctype" not in (page.rendered_html or ""):
            return ""
        # Runtime-JS als separate Asset-Datei — kein inline JS im Template
        return '<script src="/assets/grapebuild/js/grapebuild-runtime.js" defer></script>'

    def _page_script(self, page) -> str:
        if not page.page_script:
            return ""
        # Nur für privilegierte Rollen
        if "Website Developer" not in frappe.get_roles(frappe.session.user):
            return ""
        return f"<script>{page.page_script}</script>"

    def _check_access(self, page):
        if page.access_type == "public" or not page.access_type:
            return None
        if page.access_type == "frappe_login":
            if frappe.session.user == "Guest":
                login_slug = self._get_login_slug(page)
                frappe.local.response["type"] = "redirect"
                frappe.local.response["location"] = f"/{login_slug}?next=/{page.slug}"
                return build_response("")
        return None

    def _get_login_slug(self, page) -> str:
        if page.login_page:
            lp = frappe.get_doc("GrapeBuild Page", page.login_page)
            return lp.slug
        s = self._get_site_settings()
        if s.login_page:
            lp = frappe.get_doc("GrapeBuild Page", s.login_page)
            return lp.slug
        return "login"

    def _get_site_settings(self):
        cached = frappe.cache.get_value("grapebuild_site_settings")
        if cached:
            return frappe._dict(cached)
        doc = frappe.get_single("GrapeBuild Site Settings")
        data = {
            "site_language": doc.site_language, "primary_color": doc.primary_color,
            "secondary_color": doc.secondary_color, "accent_color": doc.accent_color,
            "default_font": doc.default_font, "heading_font": doc.heading_font,
            "border_radius": doc.border_radius, "head_scripts": doc.head_scripts,
            "body_scripts": doc.body_scripts, "base_url": doc.base_url,
            "login_page": doc.login_page, "sitemap_enabled": doc.sitemap_enabled,
        }
        frappe.cache.set_value("grapebuild_site_settings", data, expires_in_sec=300)
        return frappe._dict(data)
```

---

## 📡 PUBLISH API — VOLLSTÄNDIG

```python
# grapebuild/api/page_api.py
import frappe, nh3, re
from grapebuild.renderer.cache import invalidate_page_cache
from grapebuild.utils import sanitize_html, inject_image_optimizations

@frappe.whitelist()
def publish_page(page_name: str, gjs_html: str, gjs_css: str, gjs_data: str):
    frappe.has_permission("GrapeBuild Page", "write", throw=True)

    if not gjs_html or not gjs_html.strip():
        frappe.throw("Leerer HTML-Inhalt kann nicht veröffentlicht werden")

    # CSS-Sicherheitsprüfung
    if re.search(r'url\s*\(\s*["\']?\s*javascript:', gjs_css or "", re.I):
        frappe.throw("Ungültiges CSS erkannt")

    # HTML bereinigen + Bild-Optimierungen
    clean_html = sanitize_html(gjs_html)
    clean_html = inject_image_optimizations(clean_html)

    page = frappe.get_doc("GrapeBuild Page", page_name)
    page.rendered_html = clean_html
    page.rendered_css  = gjs_css
    page.gjs_data      = gjs_data
    page.published     = 1
    page.published_on  = frappe.utils.now_datetime()
    page.save()

    invalidate_page_cache(page.slug)

    settings = frappe.get_single("GrapeBuild Site Settings")
    return {
        "success":  True,
        "url":      f"{settings.base_url or ''}/{page.slug}",
        "warnings": _publish_warnings(page, clean_html),
    }

def _publish_warnings(page, html: str) -> list:
    w = []
    if not page.meta_description: w.append("Keine Meta-Description — schadet SEO")
    if "<h1" not in html:          w.append("Kein H1-Tag gefunden")
    if page.page_title.strip() == "": w.append("Kein Seitentitel gesetzt")
    return w

@frappe.whitelist()
def save_page(page_name: str, gjs_data: str):
    """Zwischenspeichern ohne Publish — kein HTML-Rendering."""
    frappe.has_permission("GrapeBuild Page", "write", throw=True)
    frappe.db.set_value("GrapeBuild Page", page_name, "gjs_data", gjs_data)
    frappe.db.commit()
    return {"success": True}

@frappe.whitelist()
def load_page(page_name: str) -> dict:
    frappe.has_permission("GrapeBuild Page", "read", throw=True)
    page = frappe.get_doc("GrapeBuild Page", page_name)
    return {
        "gjs_data":    page.gjs_data or "{}",
        "page_title":  page.page_title,
        "slug":        page.slug,
        "published":   page.published,
        "access_type": page.access_type,
    }

@frappe.whitelist()
def list_pages() -> list:
    frappe.has_permission("GrapeBuild Page", "read", throw=True)
    return frappe.get_all("GrapeBuild Page",
        fields=["name","page_title","slug","published","published_on",
                "modified","page_type","thumbnail"],
        order_by="modified desc")

@frappe.whitelist()
def create_page(page_title: str, slug: str = "", page_type: str = "Page") -> dict:
    frappe.has_permission("GrapeBuild Page", "create", throw=True)
    if not slug:
        import re
        slug = re.sub(r"[^a-z0-9]+", "-", page_title.lower()).strip("-")
    if frappe.db.exists("GrapeBuild Page", {"slug": slug}):
        frappe.throw(f"Slug '{slug}' ist bereits vergeben")
    page = frappe.get_doc({
        "doctype": "GrapeBuild Page",
        "page_title": page_title,
        "slug": slug,
        "page_type": page_type,
        "published": 0,
    })
    page.insert()
    return {"name": page.name, "slug": page.slug}
```

---

## 🎨 KOMPONENTEN-BIBLIOTHEK

```python
# grapebuild/api/component_api.py
import os, json, frappe

def _get_components_dir():
    return os.path.join(frappe.get_app_path("grapebuild"), "components")

@frappe.whitelist()
def get_component_library() -> list:
    """Kombiniert Datei-Komponenten + DB-Komponenten."""
    blocks = []
    blocks += _scan_file_components()
    blocks += _get_db_components()
    return blocks

def _scan_file_components() -> list:
    base = _get_components_dir()
    if not os.path.exists(base):
        return []
    result = []
    for name in sorted(os.listdir(base)):
        path = os.path.join(base, name)
        if not os.path.isdir(path) or name.startswith("_"):
            continue
        comp = _load_component(path, name)
        if comp:
            result.append(comp)
    return result

def _load_component(path: str, name: str) -> dict | None:
    html_file = os.path.join(path, f"{name}.html")
    if not os.path.exists(html_file):
        html_file = os.path.join(path, "index.html")
        if not os.path.exists(html_file):
            return None

    html = open(html_file).read()
    css  = open(os.path.join(path, f"{name}.css")).read() if os.path.exists(os.path.join(path, f"{name}.css")) else ""
    js   = open(os.path.join(path, f"{name}.js")).read()  if os.path.exists(os.path.join(path, f"{name}.js"))  else ""
    meta = {"label": name.replace("-"," ").title(), "category": "Komponenten"}
    if os.path.exists(os.path.join(path, "meta.json")):
        meta.update(json.load(open(os.path.join(path, "meta.json"))))

    preview = None
    for ext in ["png","jpg","webp","svg"]:
        if os.path.exists(os.path.join(path, f"preview.{ext}")):
            preview = f"/assets/grapebuild/components/{name}/preview.{ext}"
            break

    return {
        "id": f"gb-file-{name}",
        "label": meta.get("label"), "category": meta.get("category"),
        "tags": meta.get("tags", []), "source": "file",
        "content": {"html": html, "css": css, "script": js or None},
        "preview_url": preview,
    }

def _get_db_components() -> list:
    recs = frappe.get_all("GrapeBuild Block Template",
        fields=["name","block_label","block_category","gjs_component","is_active"],
        filters={"is_active": 1})
    result = []
    for r in recs:
        try:
            comp_data = json.loads(r.gjs_component or "{}")
        except Exception:
            comp_data = {}
        result.append({
            "id": f"gb-db-{r.name}",
            "label": r.block_label or r.name,
            "category": r.block_category or "Gespeichert",
            "source": "database",
            "content": comp_data,
        })
    return result

@frappe.whitelist()
def save_component_from_editor(label: str, category: str, gjs_json: str) -> dict:
    """Nutzer speichert einen Block aus dem Editor als wiederverwendbare Komponente."""
    frappe.has_permission("GrapeBuild Block Template", "create", throw=True)
    doc = frappe.get_doc({
        "doctype": "GrapeBuild Block Template",
        "block_name": label,
        "block_label": label,
        "block_category": category,
        "gjs_component": gjs_json,
        "is_active": 1,
    })
    doc.insert()
    return {"name": doc.name}
```

---

## 🌐 DATEN-API (Dynamic Blocks)

```python
# grapebuild/api/data_api.py
import frappe, json

@frappe.whitelist(allow_guest=True)
def get_dynamic_data(doctype: str, fields, filters=None, order_by: str = "modified desc", limit: int = 10):
    """Öffentlicher Endpunkt für Dynamic Blocks — kein CSRF nötig (read-only)."""
    frappe.has_permission(doctype, "read", throw=True)

    if isinstance(fields, str):
        fields = json.loads(fields)
    if isinstance(filters, str):
        filters = json.loads(filters) if filters else []

    return frappe.get_all(
        doctype, fields=fields, filters=filters or [],
        order_by=order_by, limit=min(int(limit), 100),
        ignore_permissions=False,
    )

@frappe.whitelist()
def get_doctype_list() -> list:
    """Alle DocTypes die der Nutzer lesen darf — für Block-Konfigurations-UI."""
    return [d.name for d in frappe.get_all("DocType",
        filters={"istable": 0, "issingle": 0, "module": ["!=", "Core"]},
        fields=["name"], order_by="name")]

@frappe.whitelist()
def get_doctype_fields(doctype: str) -> list:
    frappe.has_permission(doctype, "read", throw=True)
    meta = frappe.get_meta(doctype)
    skip = {"Section Break","Column Break","Tab Break","HTML","Button","Table"}
    return [
        {"fieldname": f.fieldname, "label": f.label, "fieldtype": f.fieldtype}
        for f in meta.fields
        if f.fieldtype not in skip and f.fieldname
    ]
```

---

## 🕷️ IMPORTER

```python
# grapebuild/api/import_api.py
import frappe, requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re, json
from grapebuild.utils import validate_import_url, sanitize_html

@frappe.whitelist()
def analyze_url(url: str) -> dict:
    """Schnelle Vorab-Analyse — ermittelt Seiten-Typ und empfiehlt Import-Modus."""
    frappe.has_permission("GrapeBuild Page", "write", throw=True)
    safe_url = validate_import_url(url)

    resp = requests.get(safe_url, timeout=10,
                        headers={"User-Agent": "GrapeBuild-Analyzer/1.0"})
    soup = BeautifulSoup(resp.text, "lxml")

    body_text = soup.body.get_text(strip=True) if soup.body else ""
    scripts   = [s.get("src","") for s in soup.find_all("script", src=True)]
    uses_fw   = any(kw in " ".join(scripts).lower()
                    for kw in ["react","vue","angular","next","nuxt","_next","svelte"])
    needs_js  = uses_fw or len(body_text) < 300

    return {
        "title":       soup.title.string if soup.title else "",
        "needs_js":    needs_js,
        "mode":        "full" if needs_js else "simple",
        "detected_cms": _detect_cms(soup, resp.headers),
        "nav_links":   _find_nav_links(soup, url),
        "recommendation": (
            "JavaScript-Framework erkannt — vollständiger Import empfohlen (15–20 Sek.)"
            if needs_js else "Einfacher Import möglich (unter 5 Sek.)"
        )
    }

@frappe.whitelist()
def import_simple(url: str) -> dict:
    """requests-basierter Import — für statische/CMS-Sites."""
    frappe.has_permission("GrapeBuild Page", "write", throw=True)
    safe_url = validate_import_url(url)

    resp = requests.get(safe_url, timeout=15,
                        headers={"User-Agent": "GrapeBuild-Importer/1.0"},
                        allow_redirects=True, verify=True,
                        stream=True)
    # Max 5 MB
    content = b""
    for chunk in resp.iter_content(8192):
        content += chunk
        if len(content) > 5 * 1024 * 1024:
            frappe.throw("Seite überschreitet 5 MB Limit")

    base_url = resp.url
    soup     = BeautifulSoup(content.decode("utf-8", errors="replace"), "lxml")
    css      = _collect_css(soup, base_url)
    _absolutize_images(soup, base_url)
    body_html = str(soup.body) if soup.body else str(soup)
    clean     = sanitize_html(body_html)

    return {
        "html":     clean,
        "css":      css,
        "analysis": _analyze_design(soup, css),
        "warnings": _warnings(soup, resp.text),
        "mode":     "simple",
    }

@frappe.whitelist()
def import_full(url: str) -> dict:
    """Playwright-basierter Import — für JS-Framework-Sites."""
    frappe.has_permission("GrapeBuild Page", "write", throw=True)
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        frappe.throw("Playwright nicht installiert. Bitte: pip install playwright && playwright install chromium")

    safe_url = validate_import_url(url)
    captured_css = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page    = browser.new_page()

        def on_response(resp):
            if "text/css" in resp.headers.get("content-type",""):
                try: captured_css.append(resp.text())
                except: pass
        page.on("response", on_response)

        page.goto(safe_url, wait_until="networkidle", timeout=30000)
        html = page.content()
        screenshot = page.screenshot(full_page=True, type="png")
        browser.close()

    soup  = BeautifulSoup(html, "lxml")
    _absolutize_images(soup, safe_url)
    body  = str(soup.body) if soup.body else str(soup)
    clean = sanitize_html(body)
    css   = "\n".join(captured_css)

    return {
        "html":       clean,
        "css":        css,
        "screenshot": frappe.utils.b64encode(screenshot),  # für Vorschau im UI
        "analysis":   _analyze_design(soup, css),
        "warnings":   _warnings(soup, html),
        "mode":       "full",
    }

@frappe.whitelist()
def spider_site(base_url: str, max_pages: int = 20) -> list:
    """Folgt internen Links und sammelt alle Seiten einer Domain."""
    frappe.has_permission("GrapeBuild Page", "write", throw=True)
    safe_base = validate_import_url(base_url)
    base_domain = urlparse(safe_base).netloc

    visited, to_visit, pages = set(), {safe_base}, []

    while to_visit and len(pages) < int(max_pages):
        url = to_visit.pop()
        if url in visited:
            continue
        visited.add(url)
        try:
            safe_url = validate_import_url(url)
            resp = requests.get(safe_url, timeout=10, verify=True)
            soup = BeautifulSoup(resp.text, "lxml")
            pages.append({
                "url":   url,
                "title": soup.title.string if soup.title else url,
                "slug":  urlparse(url).path.strip("/") or "home",
            })
            for a in soup.find_all("a", href=True):
                full = urljoin(url, a["href"])
                p = urlparse(full)
                if (p.netloc == base_domain and p.scheme in {"http","https"}
                        and "#" not in full and full not in visited):
                    to_visit.add(full)
        except Exception:
            continue

    return pages

# ── Hilfsfunktionen ──────────────────────────────────────────────────────────
def _collect_css(soup, base_url: str) -> str:
    parts = []
    for tag in soup.find_all(["link","style"]):
        if tag.name == "link" and tag.get("rel") == ["stylesheet"]:
            href = tag.get("href","")
            if not href: continue
            full = urljoin(base_url, href)
            try:
                safe = validate_import_url(full)
                r = requests.get(safe, timeout=8, verify=True)
                parts.append(r.text)
            except: pass
            tag.decompose()
        elif tag.name == "style":
            parts.append(tag.string or "")
            tag.decompose()
    return "\n".join(parts)

def _absolutize_images(soup, base_url: str):
    for img in soup.find_all("img"):
        src = img.get("src","")
        if src and not src.startswith(("http","data:")):
            img["src"] = urljoin(base_url, src)
    for el in soup.find_all(style=True):
        el["style"] = re.sub(
            r'url\(["\']?(/[^)"\']*)["\']]?\)',
            lambda m: f'url({urljoin(base_url, m.group(1))})',
            el["style"]
        )

def _analyze_design(soup, css: str) -> dict:
    colors = re.findall(r'(?:color|background)[^:]*:\s*(#[0-9a-fA-F]{3,8})', css)
    from collections import Counter
    top_colors = [c for c, _ in Counter(colors).most_common(6)]
    fonts = list({f.strip().strip("'\"") for f in re.findall(r'font-family\s*:\s*([^;}\n,]+)', css)})[:4]
    google = [l.get("href","") for l in soup.find_all("link")
              if "fonts.googleapis.com" in l.get("href","")]
    return {
        "colors": top_colors,
        "fonts":  {"families": fonts, "google_fonts": google},
        "meta":   {
            "title":       soup.title.string if soup.title else "",
            "description": (soup.find("meta",{"name":"description"}) or {}).get("content",""),
        },
        "structure": {
            "has_nav":    bool(soup.find(["nav","header"])),
            "has_footer": bool(soup.find("footer")),
            "has_form":   bool(soup.find("form")),
            "image_count": len(soup.find_all("img")),
        }
    }

def _detect_cms(soup, headers) -> str:
    gen = (soup.find("meta",{"name":"generator"}) or {}).get("content","").lower()
    if "wordpress" in gen: return "WordPress"
    if "joomla"    in gen: return "Joomla"
    if "drupal"    in gen: return "Drupal"
    server = headers.get("x-powered-by","").lower()
    if "php" in server:    return "PHP/CMS"
    return "Unbekannt"

def _find_nav_links(soup, base_url: str) -> list:
    base_domain = urlparse(base_url).netloc
    links = []
    for a in (soup.find("nav") or soup).find_all("a", href=True):
        full = urljoin(base_url, a["href"])
        if urlparse(full).netloc == base_domain:
            links.append({"url": full, "label": a.get_text(strip=True)})
    return links[:20]

def _warnings(soup, html: str) -> list:
    w = []
    if "react" in html.lower() or "__NEXT_DATA__" in html:
        w.append("React/Next.js erkannt — einfacher Import eventuell unvollständig")
    if len(soup.find_all("img")) > 0 and not any(i.get("alt") for i in soup.find_all("img")):
        w.append("Bilder ohne alt-Attribut gefunden — schadet SEO/Barrierefreiheit")
    if not soup.find("h1"):
        w.append("Kein H1-Tag auf der Seite gefunden")
    return w
```

---

## 🖼️ BILD-OPTIMIERUNG

```python
# grapebuild/utils.py (Auszug)
from bs4 import BeautifulSoup
import frappe, re

def inject_image_optimizations(html: str) -> str:
    """Setzt loading, fetchpriority, decoding auf alle img-Tags."""
    soup = BeautifulSoup(html, "html.parser")
    for i, img in enumerate(soup.find_all("img")):
        if i == 0:
            img["loading"]       = "eager"
            img["fetchpriority"] = "high"
            img["decoding"]      = "sync"
        else:
            img["loading"]  = "lazy"
            img["decoding"] = "async"
        # CLS-Schutz: width/height wenn nicht gesetzt
        if not img.get("width"):
            img["width"]  = "auto"
        if not img.get("height"):
            img["height"] = "auto"
    return str(soup)

def validate_and_convert_image(file_data: bytes, filename: str) -> dict:
    """Validiert Upload und konvertiert nach WebP."""
    from PIL import Image
    import io

    MAX_SIZE   = 15 * 1024 * 1024
    MAX_DIM    = (6000, 6000)
    BLOCKED_SIG = b"<svg"

    if len(file_data) > MAX_SIZE:
        frappe.throw("Bild überschreitet 15 MB Limit")

    if BLOCKED_SIG in file_data[:1024].lower():
        frappe.throw("SVG-Uploads nicht erlaubt — bitte PNG oder WebP verwenden")

    try:
        img = Image.open(io.BytesIO(file_data))
        img.verify()
        img = Image.open(io.BytesIO(file_data))

        if img.size[0] > MAX_DIM[0] or img.size[1] > MAX_DIM[1]:
            frappe.throw(f"Bildmaße überschreiten {MAX_DIM[0]}x{MAX_DIM[1]} Pixel")

        out = io.BytesIO()
        if img.mode in ("RGBA","P","LA"):
            img = img.convert("RGBA")
            img.save(out, "WEBP", quality=82, method=4, lossless=False)
        else:
            img = img.convert("RGB")
            img.save(out, "WEBP", quality=82, method=4)

        return {
            "data":         out.getvalue(),
            "content_type": "image/webp",
            "filename":     re.sub(r'\.[^.]+$', '.webp', filename),
            "width":        img.size[0],
            "height":       img.size[1],
        }
    except Exception as e:
        frappe.throw(f"Ungültige Bilddatei: {e}")
```

---

## 💡 JS-INTEGRATION — DIE 4 EBENEN

```
Ebene 1: Globale Scripts (Site Settings → body_scripts)
         → Kein Sanitizer, nur System Manager
         → Google Analytics, Cookie-Banner, externe Libs

Ebene 2: Seiten-Script (GrapeBuild Page → page_script)
         → Kein Sanitizer, nur Rolle "Website Developer"
         → Custom Slider-Logik, Seiten-spezifische Features

Ebene 3: Komponenten-Scripts (components/*/name.js)
         → Entwickler-kontrolliert, über Dateisystem
         → GrapesJS script-Property (Closure-Limitation beachten!)
         → Kein import, kein require — standalone Funktion

Ebene 4: Dynamic Block Runtime (grapebuild-runtime.js)
         → App-intern, statisch, voll vertrauenswürdig
         → Hydration von data-frappe-doctype Elementen

REGEL: Kein User-HTML kommt ohne nh3.clean() auf die Seite.
       Nur Ebene 1+2 mit expliziter Rollenprüfung ohne Sanitizer.
```

### grapebuild-runtime.js (öffentliche Seiten)
```javascript
// /public/js/grapebuild-runtime.js
(function() {
    'use strict';
    async function fetchData(doctype, fields, filters, orderBy, limit) {
        const resp = await fetch('/api/method/grapebuild.api.data_api.get_dynamic_data', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({doctype, fields, filters, order_by: orderBy, limit})
        });
        const json = await resp.json();
        return json.message || [];
    }

    function renderTemplate(tpl, item) {
        return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) =>
            item[k] !== undefined ? String(item[k]) : '');
    }

    async function hydrate() {
        for (const block of document.querySelectorAll('[data-frappe-doctype]')) {
            const doctype = block.dataset.frappeDoctype;
            const fields  = (block.dataset.frappeFields || '').split(',').map(f=>f.trim());
            const filters = JSON.parse(block.dataset.frappeFilters || '[]');
            const orderBy = block.dataset.frappeOrderBy || 'modified desc';
            const limit   = parseInt(block.dataset.frappeLimit || '10');
            const tpl     = block.querySelector('[data-frappe-item-template]');
            if (!doctype || !tpl) continue;
            try {
                const items = await fetchData(doctype, fields, filters, orderBy, limit);
                const html  = tpl.innerHTML;
                block.innerHTML = '';
                items.forEach(item => {
                    const div = document.createElement('div');
                    div.innerHTML = renderTemplate(html, item);
                    if (div.firstElementChild) block.appendChild(div.firstElementChild);
                });
            } catch(e) {
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
```

---

## 📋 MEILENSTEINE

---

## 📋 MEILENSTEINE

> **MVP-Pfad: M0 → M1 → M4** — nach diesen drei ist GrapeBuild produktiv einsetzbar.
> Alle anderen Meilensteine erweitern das MVP, sind aber nicht für den ersten Live-Einsatz nötig.

---

### M0 — FUNDAMENT `[MVP 1/3]`
**Was:** App-Skelett, GrapesJS läuft, Speichern/Laden, Hub-Liste  
**Ziel:** GrapesJS öffnet sich im Frappe Desk. Seite kann erstellt, bearbeitet und gespeichert werden.

**Aufgaben:**
1. `bench new-app grapebuild` — App anlegen
2. `requirements.txt` mit nh3, Pillow, beautifulsoup4, lxml, requests
3. DocType `GrapeBuild Page` anlegen (alle Felder aus Spec)
4. DocType `GrapeBuild Site Settings` anlegen (Single)
5. DocType `GrapeBuild Block Template` anlegen
6. DocType `GrapeBuild Page Role` anlegen (Child)
7. `hooks.py` konfigurieren (page_renderer, doc_events)
8. Frappe Page `grapebuild_hub` — minimale Seiten-Liste (Tabelle, kein Grid)
9. Frappe Page `grapebuild_builder` — GrapesJS via CDN einbinden
10. `grapebuild_builder.js`:
    - `grapesjs.init()` mit `storageManager: false`
    - Speichern-Button → `frappe.call('save_page')`
    - URL-Parameter `?page=NAME` → `load_page()` → `editor.loadProjectData()`
11. `page_api.py`: `save_page`, `load_page`, `list_pages`, `create_page`
12. Hub: "Neue Seite" Button → `create_page()` → öffnet Editor mit `?page=NAME`
13. Hub: Tabelle mit name, title, slug, published, modified

**Tests M0:**
```bash
# AUTOMATISCH (Claude Code führt aus):
cd ~/frappe-bench
bench --site grapebuild.localhost install-app grapebuild
bench --site grapebuild.localhost migrate

# Python-Unit-Tests:
bench --site grapebuild.localhost run-tests --app grapebuild --module grapebuild.tests.test_m0

# API-Tests via curl:
curl -s -X POST "http://grapebuild.localhost:8000/api/method/grapebuild.api.page_api.create_page" \
  -H "Content-Type: application/json" \
  -H "X-Frappe-CSRF-Token: $(bench --site grapebuild.localhost execute 'print(frappe.session.get_csrf_token())')" \
  -d '{"page_title":"Testseite","slug":"test"}' | python3 -m json.tool

# Prüfen ob Page angelegt:
bench --site grapebuild.localhost execute \
  "print(frappe.db.exists('GrapeBuild Page', {'slug': 'test'}))"
```

**Interaktive Tests M0 (Nutzer prüft):**
```
□ Hub-Seite öffnet sich unter /app/grapebuild-hub ohne Fehler
□ "Neue Seite" Button erstellt eine Seite und öffnet den Editor
□ GrapesJS Canvas ist sichtbar und reagiert auf Drag & Drop
□ Ein Block in den Canvas ziehen → Speichern → Seite neu laden → Block ist noch da
□ Keine JavaScript-Fehler in der Browser-Konsole
```

---

### M1 — ÖFFENTLICHE WEBSITE `[MVP 2/3]`
**Was:** Custom Renderer, URLs funktionieren, Publish-Flow  
**Ziel:** `https://meinsite.localhost:8000/meine-seite` liefert das gestaltete HTML.

**Aufgaben:**
1. `renderer/page_renderer.py` vollständig (aus Spec oben)
2. `renderer/cache.py` — `invalidate_page_cache`, `on_page_change`
3. `page_api.py`: `publish_page` vollständig (nh3, inject_image_optimizations)
4. `utils.py`: `sanitize_html`, `inject_image_optimizations`, `validate_import_url`
5. Publish-Button im Editor → zeigt URL + Warnungen
6. Hub: published Badge (grün = live, grau = Entwurf)
7. Hub: "Vorschau" Link öffnet published URL in neuem Tab
8. `www/sitemap.xml.html` + `sitemap.xml.py`
9. Security Headers in `after_request` Hook

**Tests M1:**
```bash
# Automatisch:
# 1. Seite publizieren via API
bench --site grapebuild.localhost execute """
import frappe
frappe.set_user('Administrator')
from grapebuild.api.page_api import publish_page
result = publish_page(
    page_name='test-page',
    gjs_html='<h1>Hallo GrapeBuild</h1><p>Testinhalt</p>',
    gjs_css='h1 { color: #2d6a4f; }',
    gjs_data='{}'
)
print(result)
"""

# 2. URL abrufbar?
curl -s -o /dev/null -w "%{http_code}" \
  "http://grapebuild.localhost:8000/test-page"
# Erwartet: 200

# 3. Security Headers prüfen:
curl -sI "http://grapebuild.localhost:8000/test-page" | grep -i "x-frame\|content-security\|x-content"

# 4. Sitemap:
curl -s "http://grapebuild.localhost:8000/sitemap.xml" | grep "test-page"

# 5. XSS-Test — script-Tags müssen entfernt werden:
bench --site grapebuild.localhost execute """
from grapebuild.utils import sanitize_html
result = sanitize_html('<p>OK</p><script>alert(1)</script><img onload=\"alert(2)\" src=\"x\">')
print('PASS' if '<script>' not in result and 'onload' not in result else 'FAIL')
"""

# 6. Slug-Kollision:
bench --site grapebuild.localhost execute """
import frappe
frappe.set_user('Administrator')
try:
    from grapebuild.api.page_api import create_page
    create_page('Duplikat', 'test')  # slug 'test' bereits vergeben
    print('FAIL — doppelter Slug wurde akzeptiert')
except frappe.ValidationError:
    print('PASS — Slug-Kollision korrekt abgefangen')
"""
```

**Interaktive Tests M1:**
```
□ Eine Seite publizieren → URL im Browser öffnen → Inhalt sichtbar
□ Nicht-publizierte Seite → URL → 404 (nicht 500)
□ Published-Badge im Hub wechselt nach Publish auf grün
□ Sitemap.xml enthält die publishte Seite
□ View-Source der publizierten Seite: kein <script>, kein data-gjs-* Attribut
□ Security-Headers in den Browser-Dev-Tools sichtbar (F12 → Network → Headers)
```

---

### M2 — HUB + TEMPLATES + SITE-EINSTELLUNGEN `[POST-MVP]`
**Was:** Vollständiger Hub (Cards, Suche), Template-Picker, Site Settings Panel  
**Ziel:** Professionelle Übersichtsseite, Seite aus Vorlage starten, Farben/Fonts global setzen.

> ⚡ **Hinweis:** M4 (DocType-Binding) hat höhere Priorität als M2.
> Nach M1 direkt zu M4 springen — M2 danach nachholen.

**Aufgaben:**
1. Hub: Karten-Grid (statt Tabelle) — Thumbnail, Status-Badge, Schnell-Aktionen
2. Hub: Suchfeld über alle Seiten
3. Hub: Filter (Alle / Veröffentlicht / Entwürfe)
4. Hub: Seite duplizieren, Seite löschen (mit Bestätigung)
5. Template-Picker Modal beim "Neue Seite" Dialog
6. `template_api.py`: `get_template_library`, `apply_template`
7. `templates/` Ordner mit 3 Starter-Vorlagen anlegen
8. Site Settings Panel im Hub (Tab oder eigene Seite)
9. Design-Tokens (Farben, Fonts) → CSS Custom Properties in assembleHtml()
10. GrapesJS: Tailwind CDN im Canvas laden (für Preview)
11. Responsive Preview Toggle im Editor (Mobile/Tablet/Desktop)

**Tests M2:**
```bash
# Automatisch:
# 1. Template-Library laden
bench --site grapebuild.localhost execute """
from grapebuild.api.template_api import get_template_library
templates = get_template_library()
print(f'Templates gefunden: {len(templates)}')
for t in templates:
    print(f'  - {t[\"name\"]} ({t[\"category\"]})')
"""

# 2. Template anwenden
bench --site grapebuild.localhost execute """
import frappe
frappe.set_user('Administrator')
from grapebuild.api.page_api import create_page
page = create_page('Template-Test', 'template-test')
from grapebuild.api.template_api import apply_template
result = apply_template(page['name'], 'landing-minimal', confirm=True)
print('PASS' if 'pages' in result else 'FAIL')
"""

# 3. Design Tokens prüfen
bench --site grapebuild.localhost execute """
import frappe
doc = frappe.get_single('GrapeBuild Site Settings')
doc.primary_color = '#ff0000'
doc.save()
frappe.cache.delete_value('grapebuild_site_settings')
# Prüfen ob Cache geleert
cached = frappe.cache.get_value('grapebuild_site_settings')
print('PASS — Cache geleert' if not cached else 'FAIL — Cache nicht geleert')
"""
```

**Interaktive Tests M2:**
```
□ "Neue Seite" Dialog zeigt Template-Picker mit Vorschaubildern
□ Vorlage wählen → Editor öffnet mit Template-Inhalt vorgeladen
□ Primärfarbe in Site Settings ändern → published Seite neu laden → Farbe hat sich geändert
□ Seite im Hub duplizieren → neues Duplikat erscheint in der Liste
□ Seite löschen → Bestätigungsdialog → Seite weg → URL gibt 404
□ Responsive-Toggle im Editor: Mobile-Ansicht zeigt schmalen Canvas
```

---

### M3 — KOMPONENTEN-BIBLIOTHEK `[POST-MVP]`
**Was:** Dateibasierte Komponenten, DB-Komponenten, Block-Sidebar im Editor  
**Ziel:** Drag & Drop eigener Komponenten aus der Sidebar in den Canvas.

**Aufgaben:**
1. `component_api.py` vollständig (Scanner + DB-Komponenten)
2. `components/` Ordner mit 8 Starter-Komponenten:
   - `site-header` (mit Navigation)
   - `site-footer`
   - `hero-section`
   - `feature-cards` (3-spaltig)
   - `team-grid`
   - `faq-accordion` (mit JS)
   - `contact-form`
   - `event-list` (Dynamic Block Platzhalter)
3. GrapesJS Editor: Komponenten-API beim Start laden
4. Block-Manager: Komponenten nach Kategorie gruppiert
5. Block-Manager: Suche über Tags
6. "Als Komponente speichern" Button im Editor
7. Vorschaubilder in Sidebar (preview.png oder Placeholder)
8. `grapebuild-plugin.js`: Custom Component Types registrieren

**Tests M3:**
```bash
# Automatisch:
# 1. Alle Komponenten-Ordner scannen
bench --site grapebuild.localhost execute """
from grapebuild.api.component_api import get_component_library
components = get_component_library()
file_comps = [c for c in components if c['source'] == 'file']
print(f'Datei-Komponenten: {len(file_comps)}')
expected = ['site-header','site-footer','hero-section','feature-cards',
            'team-grid','faq-accordion','contact-form','event-list']
for name in expected:
    found = any(f'gb-file-{name}' == c['id'] for c in file_comps)
    print(f'  {name}: {\"PASS\" if found else \"FAIL\"}')
"""

# 2. Komponente mit fehlender HTML-Datei überspringen
bench --site grapebuild.localhost execute """
import os, frappe
# Leeren Ordner anlegen
test_dir = os.path.join(frappe.get_app_path('grapebuild'), 'components', '_test-empty')
os.makedirs(test_dir, exist_ok=True)
from grapebuild.api.component_api import _load_component
result = _load_component(test_dir, '_test-empty')
print('PASS — leere Komponente korrekt ignoriert' if result is None else 'FAIL')
os.rmdir(test_dir)
"""

# 3. DB-Komponente speichern und laden
bench --site grapebuild.localhost execute """
import frappe
frappe.set_user('Administrator')
from grapebuild.api.component_api import save_component_from_editor
result = save_component_from_editor('Test Block', 'Test', '{\"html\":\"<p>Test</p>\"}')
print(f'Gespeichert: {result[\"name\"]}')
from grapebuild.api.component_api import _get_db_components
db_comps = _get_db_components()
found = any('Test Block' == c['label'] for c in db_comps)
print('PASS' if found else 'FAIL')
"""
```

**Interaktive Tests M3:**
```
□ Block-Sidebar im Editor zeigt Kategorien mit Komponenten
□ hero-section in Canvas ziehen → erscheint korrekt
□ faq-accordion Block hinzufügen → Akkordeon funktioniert (Klick klappt auf)
□ Block selektieren → rechts-klick → "Als Komponente speichern" → im Hub sichtbar
□ Suche in Block-Sidebar funktioniert (z.B. "header" findet site-header)
□ Komponenten-Datei bearbeiten → Editor neu laden → Änderung sichtbar
```

---

### M4 — DOCTYPE-DATENBINDUNG `[MVP 3/3 — KERN-DIFFERENZIATOR]`
**Was:** Blöcke mit echten Frappe-Daten, Live-Vorschau im Editor  
**Ziel:** "Veranstaltungsliste" Block zeigt echte OWF-Events — im Editor UND auf der Website.

> 🎯 **Das ist das Alleinstellungsmerkmal von GrapeBuild.** Kein anderes Frappe-Tool
> verbindet visuellen Website-Builder direkt mit DocType-Daten.
> Nach M4 ist GrapeBuild für diedells.de, owf und ECG produktiv einsetzbar.

**Frappe v16 Besonderheit für `get_dynamic_data`:**
```python
# v16: frappe.qb ist bevorzugt für komplexere Queries
# Für einfache get_all() ist frappe.get_all() weiterhin korrekt
# ABER: order_by Parameter-Validierung in v16 strenger
# Immer validieren: nur erlaubte Zeichen in order_by
import re
def _validate_order_by(order_by: str) -> str:
    # Nur: "field asc", "field desc", "field1 asc, field2 desc"
    if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*(?: (?:asc|desc))?(,\s*[a-zA-Z_][a-zA-Z0-9_]*(?: (?:asc|desc))?)*$', order_by, re.I):
        return "modified desc"  # Sicherer Default
    return order_by
```

**Aufgaben:**
1. `data_api.py` vollständig (`get_dynamic_data`, `get_doctype_list`, `get_doctype_fields`)
2. GrapesJS Custom Component Type: `grapebuild-dynamic-list`
   - Traits: DocType, Felder (Checkboxen), Filter (einfacher Builder), Limit
   - Live-Preview: beim Trait-Change → API-Call → DOM aktualisieren
   - Skeleton-Loader während Daten laden
3. GrapesJS Custom Component Type: `grapebuild-form`
   - Bindet an DocType → erstellt neuen Datensatz
   - Felder aus DocType-Metadaten automatisch rendern
4. `grapebuild-runtime.js` vollständig (bereits in Spec definiert)
5. Publish: Dynamic-Blocks-Marker im HTML erhalten (data-frappe-*)
6. Server-Side Pre-Hydration Option (für SEO-kritische Seiten)

**Tests M4:**
```bash
# Automatisch:
# 1. get_dynamic_data API Test
bench --site grapebuild.localhost execute """
import frappe
frappe.set_user('Administrator')
from grapebuild.api.data_api import get_dynamic_data
# User DocType ist immer vorhanden
result = get_dynamic_data('User', ['name','email'], limit=3)
print(f'PASS — {len(result)} User gefunden' if result else 'FAIL — keine Daten')
"""

# 2. Limit-Cap: max 100
bench --site grapebuild.localhost execute """
from grapebuild.api.data_api import get_dynamic_data
result = get_dynamic_data('User', ['name'], limit=999)
print('PASS — Limit gecapped' if len(result) <= 100 else 'FAIL — Limit nicht gecapped')
"""

# 3. Kein Zugriff für Guest auf private DocTypes
bench --site grapebuild.localhost execute """
import frappe
frappe.set_user('Guest')
try:
    from grapebuild.api.data_api import get_dynamic_data
    get_dynamic_data('User', ['name'])
    print('FAIL — Guest hat Zugriff auf User DocType')
except frappe.PermissionError:
    print('PASS — Guest korrekt abgeblockt')
"""

# 4. Runtime-JS: Prüfen ob data-frappe-doctype erkannt wird
bench --site grapebuild.localhost execute """
html = '<div data-frappe-doctype=\"User\" data-frappe-fields=\"name,email\"><div data-frappe-item-template>{{name}}</div></div>'
from grapebuild.renderer.page_renderer import GrapeBuildPageRenderer
renderer = GrapeBuildPageRenderer.__new__(GrapeBuildPageRenderer)
has_dynamic = 'data-frappe-doctype' in html
print('PASS' if has_dynamic else 'FAIL')
"""
```

**Interaktive Tests M4:**
```
□ Dynamic-List Block in Editor ziehen → DocType "User" wählen → Live-Vorschau zeigt User-Namen
□ Seite publishen → Published URL öffnen → Dynamic-Block zeigt echte Daten
□ Neuen User in Frappe anlegen → Published URL neu laden → neuer User erscheint
□ Formular-Block: Felder sichtbar → Absenden → neuer Datensatz in Frappe angelegt
□ Browser-DevTools → Network → API-Call zu get_dynamic_data sichtbar
□ Seite ohne Dynamic Blocks: kein Runtime-JS im Page-Source
```

---

### M5 — EINFACHER IMPORTER `[POST-MVP]`
**Was:** URL-Analyse, einfacher HTTP-Import, HTML-Paste, Import-Dialog im Hub  
**Ziel:** diedells.de URL eingeben → Import → im Editor bearbeitbar.

**Aufgaben:**
1. `import_api.py`: `analyze_url`, `import_simple` vollständig
2. Import-Dialog im Hub (3-Phasen-Modal):
   - Phase 1: URL eingeben + Analyse-Report (Farben, Fonts, CMS)
   - Phase 2: Vorschau + Optionen (CSS übernehmen? Design-Tokens?)
   - Phase 3: In neue Seite laden
3. HTML-Paste Alternative (Tab im Import-Dialog)
4. Design-Tokens aus Import → in Site Settings vorbelegen (optional)
5. Google Fonts URLs erkennen und einbetten

**Tests M5:**
```bash
# Automatisch:
# 1. SSRF-Schutz testen
bench --site grapebuild.localhost execute """
from grapebuild.utils import validate_import_url

blocked = ['http://localhost:8000', 'http://127.0.0.1', 
           'http://169.254.169.254', 'file:///etc/passwd',
           'ftp://example.com']
for url in blocked:
    try:
        validate_import_url(url)
        print(f'FAIL — {url} wurde nicht blockiert')
    except Exception as e:
        print(f'PASS — {url} blockiert: {e}')
"""

# 2. Analyse-Funktion mit öffentlicher URL
bench --site grapebuild.localhost execute """
from grapebuild.api.import_api import analyze_url
# Sichere öffentliche Test-URL
result = analyze_url('https://example.com')
print(f'PASS — Titel: {result[\"title\"]}' if result.get('title') else 'FAIL')
print(f'Modus: {result[\"mode\"]}')
"""

# 3. HTML-Sanitisierung nach Import
bench --site grapebuild.localhost execute """
from grapebuild.utils import sanitize_html
dangerous = '<p>OK</p><script>alert(1)</script><img onload=\"evil()\">'
clean = sanitize_html(dangerous)
assert '<script>' not in clean, 'FAIL — script-Tag nicht entfernt'
assert 'onload' not in clean, 'FAIL — onload nicht entfernt'
print('PASS — XSS korrekt entfernt')
"""
```

**Interaktive Tests M5:**
```
□ "Website importieren" Button im Hub öffnet Dialog
□ https://example.com eingeben → Analyse zeigt Titel, CMS, Modus
□ Import starten → neue Seite wird angelegt → im Editor öffnen
□ Importierter Inhalt ist im Editor sichtbar und bearbeitbar
□ HTML-Paste Tab: HTML einfügen → in Seite laden funktioniert
□ Eine interne URL (http://localhost) eingeben → Fehlermeldung, kein Absturz
```

---

### M6 — JS-INTEGRATION KOMPLETT + ACCESS CONTROL `[POST-MVP]`
**Was:** Alle 4 JS-Ebenen, Zugangskontrolle, Custom Login Page  
**Ziel:** Passwortgeschützte Seiten, Custom Login-Design, Site-weite Scripts.

**Aufgaben:**
1. DocType `GrapeBuild Page`: `page_script` Feld (nur für Website Developer sichtbar)
2. DocType `GrapeBuild Page`: `access_type` Felder vollständig
3. DocType `GrapeBuild Page Role`: Child Table
4. Renderer: `_check_access()` vollständig implementieren
5. Renderer: `_page_script()` mit Rollen-Check
6. GrapesJS Custom Component: `grapebuild-login-form`
7. Site Settings: Login-Konfiguration Tab vollständig
8. Hub: Zugangsverwaltungs-Übersicht

**Tests M6:**
```bash
# Automatisch:
# 1. Access Control: frappe_login Schutz
bench --site grapebuild.localhost execute """
import frappe
frappe.set_user('Administrator')
# Seite mit frappe_login Schutz anlegen
page = frappe.get_doc({
    'doctype': 'GrapeBuild Page',
    'page_title': 'Geschützt',
    'slug': 'geschuetzt-test',
    'published': 1,
    'rendered_html': '<h1>Nur für eingeloggte Nutzer</h1>',
    'rendered_css': '',
    'access_type': 'frappe_login',
})
page.insert()
print(f'Seite angelegt: {page.name}')
"""

# 2. Guest-Redirect prüfen
curl -s -o /dev/null -w "%{http_code}" \
  "http://grapebuild.localhost:8000/geschuetzt-test"
# Erwartet: 302 (Redirect zu Login)

# 3. Page Script Rollen-Check
bench --site grapebuild.localhost execute """
import frappe
frappe.set_user('test@example.com')  # normaler User ohne Website Developer Rolle
from grapebuild.renderer.page_renderer import GrapeBuildPageRenderer
renderer = GrapeBuildPageRenderer.__new__(GrapeBuildPageRenderer)
# Simuliere page.page_script
class MockPage:
    page_script = 'alert(\"xss\")'
result = renderer._page_script(MockPage())
print('PASS — Script korrekt blockiert' if result == '' else 'FAIL — Script durchgekommen')
"""
```

**Interaktive Tests M6:**
```
□ Seite auf access_type="frappe_login" setzen → als Guest öffnen → Redirect zur Login-Seite
□ Als Admin einloggen → geschützte Seite öffnen → Inhalt sichtbar
□ page_script Feld nur für Website Developer sichtbar in DocType-View
□ Site Settings → body_scripts → Google Analytics Code eintragen → auf published Seite sichtbar
□ Login-Form Block: in GrapeBuild-Seite platzieren → Login funktioniert → Redirect korrekt
```

---

### M7 — PLAYWRIGHT-IMPORTER + SPIDER `[POST-MVP]`
**Was:** Vollständiger JS-Import, Multi-Page Spider  
**Ziel:** React-Sites importierbar, gesamte Website in einem Schritt.

**Aufgaben:**
1. Playwright als optionale Abhängigkeit installieren
2. `import_api.py`: `import_full` vollständig
3. `import_api.py`: `spider_site` vollständig
4. Import-Dialog: Modus-Auswahl (einfach / vollständig)
5. Import-Dialog: Ladeindikator mit Statusmeldungen
6. Spider-Dialog: Seitenauswahl (Checkboxen welche Seiten importiert werden)
7. Screenshot-Vorschau nach Full-Import
8. Fehlerbehandlung: was passiert wenn Playwright nicht installiert ist

**Tests M7:**
```bash
# Automatisch:
# 1. Playwright verfügbar?
bench --site grapebuild.localhost execute """
try:
    import playwright
    print(f'PASS — Playwright {playwright.__version__} verfügbar')
except ImportError:
    print('INFO — Playwright nicht installiert (optional)')
"""

# 2. SSRF auch im Full-Importer
bench --site grapebuild.localhost execute """
import frappe
frappe.set_user('Administrator')
try:
    from grapebuild.api.import_api import import_full
    import_full('http://169.254.169.254/latest/meta-data/')
    print('FAIL — SSRF nicht blockiert')
except Exception as e:
    print(f'PASS — SSRF blockiert: {e}')
"""

# 3. Spider bleibt auf Domain
bench --site grapebuild.localhost execute """
from grapebuild.api.import_api import spider_site
# Mit max_pages=2 um schnell zu testen
result = spider_site('https://example.com', max_pages=2)
external = [p for p in result if 'example.com' not in p['url']]
print('PASS — nur interne Links' if not external else f'FAIL — {len(external)} externe Links')
"""
```

**Interaktive Tests M7:**
```
□ React-Site URL eingeben → "Vollständiger Import" wählen → Ladebalken erscheint → Inhalt geladen
□ Spider-Funktion: URL eingeben → Liste gefundener Seiten → Auswahl → Import
□ Wenn Playwright nicht installiert: hilfreiche Fehlermeldung mit Installationsbefehl
□ Screenshot-Vorschau nach Full-Import sichtbar im Dialog
```

---

### M8 — PERFORMANCE + POLISH `[POST-MVP]`
**Was:** Caching, WebP-Upload, Sitemap, 404-Handling, Publish-Warnungen  
**Ziel:** Lighthouse Score > 90 auf published Seiten.

**Aufgaben:**
1. Bild-Upload Hook: WebP-Konvertierung via Pillow
2. Cache-Strategie vollständig (SLUG_CACHE_KEY, RENDER_CACHE_KEY, TTL)
3. `www/sitemap.xml.html` vollständig mit allen public Seiten
4. Custom 404-Seite (GrapeBuild Page als 404-Handler)
5. Publish-Warnungen im Editor anzeigen (Modal nach Publish)
6. Auto-Save Indikator ("Gespeichert vor 2 Min.")
7. GrapesJS: Undo/Redo sicherstellen
8. Page Duplicate Feature vollständig

**Tests M8:**
```bash
# Automatisch:
# 1. WebP-Konvertierung
bench --site grapebuild.localhost execute """
import io
from PIL import Image
from grapebuild.utils import validate_and_convert_image

# Test-PNG erstellen
img = Image.new('RGB', (100, 100), color='red')
buf = io.BytesIO()
img.save(buf, 'PNG')
png_data = buf.getvalue()

result = validate_and_convert_image(png_data, 'test.png')
print('PASS — WebP' if result['content_type'] == 'image/webp' else 'FAIL')
print(f'Größe vorher: {len(png_data)} | nachher: {len(result[\"data\"])}')
"""

# 2. SVG-Block
bench --site grapebuild.localhost execute """
from grapebuild.utils import validate_and_convert_image
svg_data = b'<svg xmlns=\"http://www.w3.org/2000/svg\"><script>alert(1)</script></svg>'
try:
    validate_and_convert_image(svg_data, 'evil.svg')
    print('FAIL — SVG wurde akzeptiert')
except Exception as e:
    print(f'PASS — SVG blockiert: {e}')
"""

# 3. Cache-Invalidierung
bench --site grapebuild.localhost execute """
import frappe
from grapebuild.renderer.cache import invalidate_page_cache
frappe.cache.set_value('grapebuild_html_test', 'cached_content')
invalidate_page_cache('test')
result = frappe.cache.get_value('grapebuild_html_test')
print('PASS — Cache geleert' if result is None else 'FAIL — Cache noch vorhanden')
"""

# 4. LCP-Preload Test
bench --site grapebuild.localhost execute """
from grapebuild.renderer.page_renderer import GrapeBuildPageRenderer
renderer = GrapeBuildPageRenderer.__new__(GrapeBuildPageRenderer)
html = '<img src=\"/files/hero.webp\" alt=\"Hero\">'
preload = renderer._get_lcp_preload(html)
print('PASS' if 'preload' in preload and 'hero.webp' in preload else 'FAIL')
"""
```

**Interaktive Tests M8:**
```
□ Bild in GrapesJS Asset Manager hochladen → als .webp gespeichert
□ Published Seite → Lighthouse in Chrome → Performance Score > 85
□ Published Seite → DevTools → Network → Hero-Bild hat fetchpriority=high
□ Published Seite → View-Source → loading=lazy auf 2. Bild
□ Nicht-existente URL → Custom 404-Seite erscheint (nicht Frappe-Standard-404)
□ Publish-Button → Warnungs-Modal erscheint wenn Meta-Description fehlt
□ Auto-Save: nach 30 Sek. ohne Klick → "Automatisch gespeichert" Anzeige
```

---

## 🧪 GLOBALE TEST-SUITE

```python
# grapebuild/tests/test_security.py
import frappe, unittest

class TestSecurity(unittest.TestCase):

    def test_xss_in_publish(self):
        """XSS-Payloads werden beim Publish entfernt."""
        from grapebuild.utils import sanitize_html
        payloads = [
            '<script>alert(1)</script>',
            '<img onerror="alert(1)">',
            '<svg onload="alert(1)">',
            '<a href="javascript:alert(1)">click</a>',
            '<details open ontoggle="alert(1)">',
        ]
        for payload in payloads:
            result = sanitize_html(payload)
            self.assertNotIn('<script', result, f"Script nicht entfernt: {payload}")
            self.assertNotIn('onerror', result, f"onerror nicht entfernt: {payload}")
            self.assertNotIn('onload', result, f"onload nicht entfernt: {payload}")
            self.assertNotIn('ontoggle', result, f"ontoggle nicht entfernt: {payload}")

    def test_ssrf_localhost_blocked(self):
        from grapebuild.utils import validate_import_url
        for url in ['http://localhost', 'http://127.0.0.1', 'http://0.0.0.0']:
            with self.assertRaises(frappe.ValidationError):
                validate_import_url(url)

    def test_ssrf_metadata_blocked(self):
        from grapebuild.utils import validate_import_url
        with self.assertRaises(frappe.ValidationError):
            validate_import_url('http://169.254.169.254/latest/meta-data/')

    def test_ssrf_file_protocol(self):
        from grapebuild.utils import validate_import_url
        with self.assertRaises(frappe.ValidationError):
            validate_import_url('file:///etc/passwd')

    def test_slug_uniqueness(self):
        frappe.set_user('Administrator')
        from grapebuild.api.page_api import create_page
        create_page('Unique Test', 'unique-test-slug-abc')
        with self.assertRaises(frappe.ValidationError):
            create_page('Unique Test 2', 'unique-test-slug-abc')

    def test_svg_upload_blocked(self):
        from grapebuild.utils import validate_and_convert_image
        svg = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
        with self.assertRaises(frappe.ValidationError):
            validate_and_convert_image(svg, 'evil.svg')

    def test_css_javascript_url_blocked(self):
        from grapebuild.api.page_api import _check_css_safety
        with self.assertRaises(frappe.ValidationError):
            _check_css_safety('body { background: url(javascript:alert(1)); }')


# Ausführen:
# bench --site grapebuild.localhost run-tests --app grapebuild --module grapebuild.tests.test_security
```

---

## 🚦 QUICK-START FÜR CLAUDE CODE

```bash
# Schritt 1: App anlegen
cd ~/frappe-bench
bench new-app grapebuild
# Name: grapebuild | Title: GrapeBuild | Publisher: Manuel Dell
# Description: Visual Website Builder for Frappe | License: MIT

# Schritt 2: App installieren
bench --site grapebuild.localhost install-app grapebuild

# Schritt 3: Abhängigkeiten
cd apps/grapebuild
pip install -r requirements.txt --break-system-packages

# Schritt 4: Nach JEDER DocType-Änderung (Frappe v16 Pflicht!)
bench --site grapebuild.localhost migrate

# Schritt 5: Cache leeren (nach Settings-Änderungen)
bench --site grapebuild.localhost clear-cache

# Schritt 6: Nach Python-Änderungen in hooks.py oder __init__.py
bench restart

# Schritt 7: Tests ausführen
bench --site grapebuild.localhost run-tests --app grapebuild

# Schritt 8: ERPNext-Kompatibilität prüfen (wenn ERPNext installiert)
bench --site erpnext.localhost install-app grapebuild
bench --site erpnext.localhost migrate
# Wenn das ohne Fehler läuft: App ist ERPNext-kompatibel
```

### ERPNext-Kompatibilität sicherstellen

```python
# RICHTIG — nur Standard-Frappe DocTypes als Dependency:
# In grapebuild/hooks.py KEINE required_apps = ["erpnext"]

# RICHTIG — beim Referenzieren auf andere DocTypes:
# Immer prüfen ob DocType existiert bevor es verwendet wird
if frappe.db.exists("DocType", "Item"):
    # ERPNext ist installiert, Item-spezifische Features aktivieren
    pass

# FALSCH — direkte ERPNext-Imports:
# from erpnext.stock.doctype.item.item import Item  ← NICHT machen
```

---

## ⚠️ KRITISCHE REGELN FÜR DIE IMPLEMENTIERUNG

```
SECURITY:
  1. NIEMALS bleach — immer nh3 (bleach ist deprecated seit 2023)
  2. JEDE externe URL durch validate_import_url() — SSRF-Schutz
  3. KEIN User-HTML ohne sanitize_html() publishen
  4. IMMER frappe.has_permission() am Anfang jeder @frappe.whitelist()
  5. SVG-Uploads blockieren (XSS-Vektor)

FRAPPE V16:
  6. bench migrate NACH JEDER DocType-Änderung (v16 migriert nicht automatisch)
  7. bench restart NACH JEDER Änderung in hooks.py oder __init__.py
  8. frappe.get_cached_doc() für häufig gelesene Single-DocTypes (Site Settings)
  9. order_by Parameter validieren — v16 ist strenger bei SQL-Injection-Prüfung
  10. page_renderer in hooks.py MUSS korrekt sein — sonst keine öffentlichen URLs

ERPNEXT-KOMPATIBILITÄT:
  11. KEINE required_apps = ["erpnext"] in hooks.py
  12. KEINE direkten Imports aus erpnext.*
  13. Vor ERPNext-DocType-Nutzung immer: if frappe.db.exists("DocType", "Item")
  14. Nur Standard-Frappe-DocTypes als Pflicht: User, Role, File — alles andere optional

GRAPESJS:
  15. GrapesJS v1.x API — NICHT v0.x Dokumentation lesen (Breaking Changes!)
  16. KEIN localStorage/sessionStorage im Editor-JS (nicht in Frappe-Context)
  17. Komponenten-Scripts: keine Closures, kein import/require (GrapesJS-Limitation)
  18. CSS-Scoping für Komponenten nicht vergessen (sonst globaler CSS-Leak)

MVP-FOKUS:
  19. M0 → M1 → M4 zuerst. Alles andere DANACH.
  20. Bei Unsicherheit: simpelste Lösung wählen, später refactoren
```

---

## 📚 REFERENZ-LINKS

- GrapesJS v1 Docs:      https://grapesjs.com/docs/
- GrapesJS API:          https://grapesjs.com/docs/api/editor.html
- Frappe Rendering:      https://docs.frappe.io/framework/user/en/python-api/routing-and-rendering
- Frappe Portal Pages:   https://docs.frappe.io/framework/v14/user/en/portal-pages
- nh3 Docs:              https://nh3.readthedocs.io/
- Playwright Python:     https://playwright.dev/python/docs/intro

---

*GrapeBuild · Manuel Dell · Dells Dienste · Neudenau · MIT License*
*Spec-Version: 1.0 · März 2026*
```
