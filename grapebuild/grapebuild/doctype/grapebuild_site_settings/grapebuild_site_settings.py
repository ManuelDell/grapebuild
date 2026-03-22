import frappe
from frappe.model.document import Document


class GrapeBuildSiteSettings(Document):
    def after_save(self):
        frappe.cache.delete_value("grapebuild_site_settings")
