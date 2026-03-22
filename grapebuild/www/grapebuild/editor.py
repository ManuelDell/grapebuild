import frappe
from frappe.sessions import get_csrf_token

no_cache = 1
no_sitemap = 1
base_template_path = "grapebuild/templates/grapebuild_base.html"


def get_context(context):
    if frappe.session.user == "Guest":
        frappe.local.flags.redirect_location = (
            "/login?redirect-to=" + (frappe.request.path if hasattr(frappe.request, "path") else "/grapebuild/editor")
        )
        raise frappe.Redirect

    allowed_roles = {"System Manager", "Website Manager"}
    if not allowed_roles.intersection(set(frappe.get_roles())):
        frappe.throw("Keine Berechtigung", frappe.PermissionError)

    context.csrf_token = get_csrf_token()
    context.user = frappe.session.user
    context.lang = frappe.local.lang or "de"
