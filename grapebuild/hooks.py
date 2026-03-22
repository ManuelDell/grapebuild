app_name = "grapebuild"
app_title = "GrapeBuild"
app_publisher = "Manuel Dell"
app_description = "Visual Website Builder for Frappe"
app_email = "info@diedells.de"
app_license = "mit"
app_icon = "/assets/grapebuild/images/grapebuild-icon.svg"
app_color = "#F2AF0D"
app_logo_url = "/assets/grapebuild/images/grapebuild-icon.svg"

# Desk App Screen Entry — Klick öffnet direkt den www-Hub
add_to_apps_screen = [
    {
        "name": "grapebuild",
        "logo": "/assets/grapebuild/images/grapebuild-icon.svg",
        "title": "GrapeBuild",
        "route": "/grapebuild/hub",
    }
]

app_include_icons = [
    "/assets/grapebuild/images/grapebuild-icon.svg",
]

fixtures = [
    "Workspace",
]

# Custom Page Renderer — wird VOR allen Standard-Frappe-Renderern geprüft
page_renderer = "grapebuild.renderer.page_renderer.GrapeBuildPageRenderer"

# Cache-Invalidierung bei Änderungen
doc_events = {
    "GrapeBuild Page": {
        "after_save":   "grapebuild.renderer.cache.on_page_change",
        "on_trash":     "grapebuild.renderer.cache.on_page_change",
        "after_insert": "grapebuild.renderer.cache.on_page_change",
    },
    "GrapeBuild Site Settings": {
        "after_save": "grapebuild.renderer.cache.on_settings_change",
    },
}

# Security Headers für öffentliche Seiten
after_request = ["grapebuild.renderer.page_renderer.add_security_headers"]
