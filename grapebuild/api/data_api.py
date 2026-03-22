import json

import frappe


@frappe.whitelist(allow_guest=True)
def get_dynamic_data(doctype: str, fields, filters=None, order_by: str = "modified desc", limit: int = 10):
    frappe.has_permission(doctype, "read", throw=True)

    if isinstance(fields, str):
        fields = json.loads(fields)
    if isinstance(filters, str):
        filters = json.loads(filters) if filters else []

    return frappe.get_all(
        doctype,
        fields=fields,
        filters=filters or [],
        order_by=order_by,
        limit=min(int(limit), 100),
        ignore_permissions=False,
    )


@frappe.whitelist()
def get_doctype_list() -> list:
    return [d.name for d in frappe.get_all(
        "DocType",
        filters={"istable": 0, "issingle": 0, "module": ["!=", "Core"]},
        fields=["name"],
        order_by="name",
    )]


@frappe.whitelist()
def get_doctype_fields(doctype: str) -> list:
    frappe.has_permission(doctype, "read", throw=True)
    meta = frappe.get_meta(doctype)
    skip = {"Section Break", "Column Break", "Tab Break", "HTML", "Button", "Table"}
    return [
        {"fieldname": f.fieldname, "label": f.label, "fieldtype": f.fieldtype}
        for f in meta.fields
        if f.fieldtype not in skip and f.fieldname
    ]
