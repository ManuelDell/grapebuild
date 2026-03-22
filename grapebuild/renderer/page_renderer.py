import frappe
from frappe.website.page_renderers.base_renderer import BaseRenderer

SKIP_PREFIXES = (
    "/api/", "/assets/", "/files/", "/__",
    "/favicon", "/robots", "/sitemap",
    "/app/", "/desk/", "/login", "/logout",
)

SLUG_CACHE_KEY   = "grapebuild_slugs_v2"
RENDER_CACHE_KEY = "grapebuild_html_{slug}"


def _is_public_canvas_page(path: str) -> bool:
    if any(path.startswith(p) for p in SKIP_PREFIXES):
        return False
    slug = path.strip("/")
    if not slug or "." in slug.split("/")[-1]:
        return False
    cached = frappe.cache.get_value(SLUG_CACHE_KEY)
    if cached:
        return slug in set(cached)
    pages = frappe.get_all("GrapeBuild Page", fields=["slug"], filters={"published": 1})
    slugs = {p.slug for p in pages}
    frappe.cache.set_value(SLUG_CACHE_KEY, list(slugs), expires_in_sec=120)
    return slug in slugs


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
        pages = frappe.get_all("GrapeBuild Page", fields=["slug"], filters={"published": 1})
        slugs = {p.slug for p in pages}
        frappe.cache.set_value(SLUG_CACHE_KEY, list(slugs), expires_in_sec=120)
        return slugs

    def render(self):
        slug = self.path.strip("/")
        cache_key = RENDER_CACHE_KEY.format(slug=slug)

        cached = frappe.cache.get_value(cache_key)
        if cached:
            return self.build_response(cached)

        try:
            page = frappe.get_doc("GrapeBuild Page", {"slug": slug, "published": 1})
        except frappe.DoesNotExistError:
            frappe.cache.delete_value(cache_key)
            return self.build_response("<h1>404 – Seite nicht gefunden</h1>", 404)

        if page.maintenance_mode:
            return self.build_response(self._maintenance_html(page), 503)

        redirect = self._check_access(page)
        if redirect:
            return redirect

        html = self._assemble_html(page)

        has_dynamic = "data-frappe-doctype" in (page.rendered_html or "")
        ttl = 60 if has_dynamic else 3600
        frappe.cache.set_value(cache_key, html, expires_in_sec=ttl)

        return self.build_response(html)

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
        import re
        m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', html)
        if m:
            src = m.group(1)
            return f'<link rel="preload" as="image" href="{src}" fetchpriority="high">'
        return ""

    def _get_dynamic_runtime(self, page) -> str:
        if "data-frappe-doctype" not in (page.rendered_html or ""):
            return ""
        return '<script src="/assets/grapebuild/js/grapebuild-runtime.js" defer></script>'

    def _page_script(self, page) -> str:
        if not page.page_script:
            return ""
        if "Website Developer" not in frappe.get_roles(frappe.session.user):
            return ""
        return f"<script>{page.page_script}</script>"

    def _check_access(self, page):
        if page.access_type == "public" or not page.access_type:
            return None
        if page.access_type == "frappe_login":
            if frappe.session.user == "Guest":
                login_slug = self._get_login_slug(page)
                frappe.local.flags.redirect_location = f"/{login_slug}?next=/{page.slug}"
                raise frappe.Redirect
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

    def _maintenance_html(self, page) -> str:
        title = frappe.utils.escape_html(page.page_title)
        return f"""<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} – Wartung</title>
<style>body{{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;
background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-align:center;}}
.box{{max-width:480px;padding:48px 32px;}}
h1{{font-size:2rem;font-weight:700;margin-bottom:12px;color:#111827;}}
p{{color:#6b7280;font-size:1rem;line-height:1.6;}}
.icon{{font-size:3rem;margin-bottom:24px;}}</style>
</head><body><div class="box">
<div class="icon">🔧</div>
<h1>Wartungsarbeiten</h1>
<p>Diese Seite wird gerade aktualisiert. Bitte schaue später wieder vorbei.</p>
</div></body></html>"""

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
