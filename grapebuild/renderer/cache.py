import frappe

SLUG_CACHE_KEY   = "grapebuild_slugs_v2"
RENDER_CACHE_KEY = "grapebuild_html_{slug}"


def invalidate_page_cache(slug: str):
    frappe.cache.delete_value(RENDER_CACHE_KEY.format(slug=slug))
    frappe.cache.delete_value(SLUG_CACHE_KEY)


def on_page_change(doc, method=None):
    if doc.slug:
        invalidate_page_cache(doc.slug)


def on_settings_change(doc, method=None):
    frappe.cache.delete_value("grapebuild_site_settings")
    frappe.cache.delete_value(SLUG_CACHE_KEY)
