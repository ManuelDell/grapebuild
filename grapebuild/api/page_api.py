import re

import frappe

from grapebuild.renderer.cache import invalidate_page_cache
from grapebuild.utils import inject_image_optimizations, sanitize_html


@frappe.whitelist()
def publish_page(page_name: str, gjs_html: str, gjs_css: str, gjs_data: str):
    frappe.has_permission("GrapeBuild Page", "write", throw=True)

    if not gjs_html or not gjs_html.strip():
        frappe.throw("Leerer HTML-Inhalt kann nicht veröffentlicht werden")

    if re.search(r'url\s*\(\s*["\']?\s*javascript:', gjs_css or "", re.I):
        frappe.throw("Ungültiges CSS erkannt")

    clean_html = sanitize_html(gjs_html)
    clean_html = inject_image_optimizations(clean_html)

    page = frappe.get_doc("GrapeBuild Page", page_name)
    page.rendered_html = clean_html
    page.rendered_css = gjs_css
    page.gjs_data = gjs_data
    page.published = 1
    page.published_on = frappe.utils.now_datetime()
    page.save()

    invalidate_page_cache(page.slug)

    settings = frappe.get_single("GrapeBuild Site Settings")
    return {
        "success": True,
        "url": f"{settings.base_url or ''}/{page.slug}",
        "warnings": _publish_warnings(page, clean_html),
    }


def _publish_warnings(page, html: str) -> list:
    w = []
    if not page.meta_description:
        w.append("Keine Meta-Description — schadet SEO")
    if "<h1" not in html:
        w.append("Kein H1-Tag gefunden")
    if not page.page_title or not page.page_title.strip():
        w.append("Kein Seitentitel gesetzt")
    return w


@frappe.whitelist()
def save_page(page_name: str, gjs_data: str):
    frappe.has_permission("GrapeBuild Page", "write", throw=True)
    frappe.db.set_value("GrapeBuild Page", page_name, "gjs_data", gjs_data)
    frappe.db.commit()
    return {"success": True}


@frappe.whitelist()
def load_page(page_name: str) -> dict:
    frappe.has_permission("GrapeBuild Page", "read", throw=True)
    page = frappe.get_doc("GrapeBuild Page", page_name)
    return {
        "gjs_data": page.gjs_data or "{}",
        "page_title": page.page_title,
        "slug": page.slug,
        "published": page.published,
        "maintenance_mode": page.maintenance_mode,
        "access_type": page.access_type,
    }


@frappe.whitelist()
def list_pages() -> list:
    frappe.has_permission("GrapeBuild Page", "read", throw=True)
    return frappe.get_all(
        "GrapeBuild Page",
        fields=["name", "page_title", "slug", "published", "published_on",
                "modified", "page_type", "thumbnail"],
        order_by="modified desc",
    )


@frappe.whitelist()
def unpublish_page(page_name: str) -> dict:
    frappe.has_permission("GrapeBuild Page", "write", throw=True)
    page = frappe.get_doc("GrapeBuild Page", page_name)
    page.published = 0
    page.save()
    invalidate_page_cache(page.slug)
    return {"success": True}


@frappe.whitelist()
def set_maintenance_mode(page_name: str, enabled: int) -> dict:
    frappe.has_permission("GrapeBuild Page", "write", throw=True)
    frappe.db.set_value("GrapeBuild Page", page_name, "maintenance_mode", int(enabled))
    frappe.db.commit()
    page_slug = frappe.db.get_value("GrapeBuild Page", page_name, "slug")
    invalidate_page_cache(page_slug)
    return {"success": True, "maintenance_mode": int(enabled)}


@frappe.whitelist()
def create_page(page_title: str, slug: str = "", page_type: str = "Page") -> dict:
    frappe.has_permission("GrapeBuild Page", "create", throw=True)
    if not slug:
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
