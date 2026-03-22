import ipaddress
import re
import socket
from urllib.parse import urlparse

import frappe

try:
    import nh3
    _NH3_AVAILABLE = True
except ImportError:
    _NH3_AVAILABLE = False

ALLOWED_TAGS = {
    "div", "section", "article", "header", "footer", "main", "nav",
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a", "img",
    "ul", "ol", "li", "button", "table", "thead", "tbody", "tr", "th", "td",
    "figure", "figcaption", "picture", "source", "form", "input", "select", "textarea",
    "blockquote", "pre", "code", "em", "strong", "br", "hr",
}

ALLOWED_ATTRS = {
    "*": {"class", "id", "style",
          "data-frappe-doctype", "data-frappe-fields", "data-frappe-filters",
          "data-frappe-limit", "data-frappe-order-by", "data-frappe-item-template"},
    "a": {"href", "target", "title"},
    "img": {"src", "alt", "width", "height", "loading", "fetchpriority", "decoding"},
    "input": {"type", "name", "placeholder", "required", "value", "autocomplete"},
    "form": {"method", "action", "data-frappe-submit-to"},
    "source": {"srcset", "media", "type"},
}

BLOCKED_RANGES = [
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
]


def sanitize_html(html: str) -> str:
    if _NH3_AVAILABLE:
        return nh3.clean(html, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS, strip_comments=True)
    # Fallback: einfaches Entfernen von script-Tags
    html = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r'\bon\w+\s*=\s*["\'][^"\']*["\']', "", html, flags=re.IGNORECASE)
    return html


def inject_image_optimizations(html: str) -> str:
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        return html

    soup = BeautifulSoup(html, "html.parser")
    for i, img in enumerate(soup.find_all("img")):
        if i == 0:
            img["loading"] = "eager"
            img["fetchpriority"] = "high"
            img["decoding"] = "sync"
        else:
            img["loading"] = "lazy"
            img["decoding"] = "async"
        if not img.get("width"):
            img["width"] = "auto"
        if not img.get("height"):
            img["height"] = "auto"
    return str(soup)


def validate_import_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        frappe.throw(f"URL-Schema '{parsed.scheme}' nicht erlaubt")
    hostname = parsed.hostname
    if not hostname:
        frappe.throw("Ungültige URL")
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
