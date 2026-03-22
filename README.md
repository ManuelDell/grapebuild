<p align="center">
  <img src="banner.svg" alt="GrapeBuild" width="720">
</p>

<p align="center">
  <strong>Eigene Webseiten direkt aus Frappe heraus erstellen — ohne Code, ohne Agentur.</strong>
</p>

<p align="center">
  <a href="#was-ist-grapebuild">Was ist das?</a> ·
  <a href="#aktueller-stand">Aktueller Stand</a> ·
  <a href="#was-kommt-noch">Was kommt noch?</a> ·
  <a href="#installation">Installation</a>
</p>

---

## Was ist GrapeBuild?

GrapeBuild ist ein visueller Website-Baukasten, der direkt in **Frappe / ERPNext** integriert ist.

Stell dir vor: Du verwaltest deine Organisation, deine Gemeinde oder dein Unternehmen schon in Frappe — und kannst dort auch ganz einfach eine eigene Webseite zusammenbauen. Keine externe Agentur, kein WordPress, kein Einloggen in ein zweites System. Seiten anlegen, Inhalte per Drag & Drop zusammenstellen, veröffentlichen — fertig.

**Für wen ist das gedacht?**

- Gemeinden, Vereine und kleine Organisationen, die Frappe nutzen
- Alle, die eine einfache Webpräsenz brauchen, aber keine Webentwickler im Team haben
- Frappe-Nutzer, die Landing Pages, Ankündigungen oder Informationsseiten direkt aus dem System heraus pflegen möchten

**Was macht es besonders?**

GrapeBuild läuft komplett innerhalb von Frappe. Es nutzt die bestehende Nutzerverwaltung, Rollen und Berechtigungen — du musst nichts extra einrichten. Veröffentlichte Seiten sind sofort über deine Frappe-Domain erreichbar.

---

## Aktueller Stand

> **Milestone M0 abgeschlossen** — Grundstruktur steht, erste Seiten können erstellt und veröffentlicht werden.

### Was funktioniert

| Funktion | Status |
|---|---|
| Seiten-Hub (Übersicht aller Seiten) | ✅ |
| Neue Seite anlegen (mit Slug/URL-Vergabe) | ✅ |
| Visueller Editor (GrapesJS) | ✅ |
| Blöcke: Abschnitt, Spalten, Text, Bild, Button, Hero | ✅ |
| Stil-Editor (Dimension, Typografie, Hintergrund, Rahmen) | ✅ |
| Ebenen-Ansicht & Element-Attribute | ✅ |
| Speichern & Auto-Speichern | ✅ |
| Seite publizieren (live unter eigenem Slug) | ✅ |
| Seite depublizieren | ✅ |
| Wartungsmodus (zeigt Wartungsseite statt Inhalt) | ✅ |
| Redis-Cache für publizierte Seiten | ✅ |
| Rollen-basierter Zugriff (System Manager, Website Manager) | ✅ |
| App-Icon im Frappe Desk | ✅ |
| Automatische Tests (5/5) | ✅ |

### Editor-Ansicht

Der Editor öffnet sich als eigenständige Webseite (nicht im Frappe Desk), um maximale Kompatibilität mit GrapesJS sicherzustellen. Links befinden sich die Bausteine und Ebenen, in der Mitte die Vorschau-Fläche, rechts Stil und Attribute — wie bei professionellen Page-Buildern üblich.

---

## Was kommt noch?

Das Projekt ist in drei Milestones geplant:

### M1 — Inhalte & Seiten-Typen
- Blog-Einträge und Artikel mit automatischer Listen-Seite
- Formular-Blöcke (Kontakt, Anmeldung) mit Frappe-Backend
- Mehr Vorlagen-Blöcke (Testimonials, Galerie, Preistabelle)
- Medien-Bibliothek für Bilder und Dokumente
- Mehrsprachigkeit (i18n)

### M2 — Webseiten-Verwaltung
- Globale Navigation & Footer über alle Seiten
- Site-weite Einstellungen (Farben, Schrift, Logo)
- Sitemap & SEO-Optimierungen
- Passwortgeschützte Seiten (für Mitglieder-Bereiche)
- Custom Domain-Unterstützung

### M3 — Integration & Erweiterbarkeit
- Daten aus Frappe live auf Seiten einbinden (z. B. Veranstaltungen, Produkte)
- Block-Vorlagen als eigene DocTypes speichern und teilen
- Migrations-Werkzeug (Import aus anderen Systemen)
- API für externe Entwickler

---

## Mitmachen

Feedback, Ideen und Pull Requests sind herzlich willkommen. Das Projekt steht unter MIT-Lizenz.

Issues und Vorschläge bitte über [GitHub Issues](https://github.com/ManuelDell/grapebuild/issues) einreichen.

---
---

## Installation

### Voraussetzungen

- [Frappe Bench](https://github.com/frappe/bench) v5+
- Frappe Framework v16
- Python ≥ 3.11
- Eine laufende Frappe-Site

### App installieren

```bash
# App herunterladen
bench get-app https://github.com/ManuelDell/grapebuild

# Auf einer bestimmten Site installieren
bench --site <deine-site> install-app grapebuild

# Datenbank migrieren (erstellt alle DocTypes)
bench --site <deine-site> migrate

# Dienste neu starten
bench restart
```

Nach der Installation erscheint **GrapeBuild** im Frappe App-Bildschirm und in der Desk-Seitenleiste. Ein Klick öffnet den Seiten-Hub.

### Für Entwickler: Lokale Entwicklungsumgebung

```bash
# Repo klonen
cd frappe-bench/apps
git clone https://github.com/ManuelDell/grapebuild

# In der Entwicklungsumgebung installieren
pip install -e apps/grapebuild

bench --site <deine-site> install-app grapebuild
bench --site <deine-site> migrate

# Pre-commit Hooks einrichten (Codequalität)
cd apps/grapebuild
pre-commit install
```

### Technischer Stack

| Schicht | Technologie |
|---|---|
| Framework | Frappe v16 (Python + MariaDB) |
| Editor | GrapesJS v0.21.13 (CDN, kein Build-Schritt nötig) |
| HTML-Sanitierung | nh3 (Rust-basiert, SSRF-sicher) |
| Cache | Redis (über Frappe-Cache-API) |
| Frontend | Vanilla JS, kein Node-Build-Schritt |
| Seiten-Rendering | Custom Frappe `BaseRenderer` Subklasse |

### Projektstruktur

```
grapebuild/
├── api/
│   └── page_api.py          # Whitelist-Methoden: create, load, save, publish, ...
├── grapebuild/              # Frappe-Modul (DocTypes, Workspace)
│   └── doctype/
│       ├── grapebuild_page/
│       ├── grapebuild_site_settings/
│       ├── grapebuild_block_template/
│       └── grapebuild_page_role/
├── public/
│   ├── css/                 # Editor- und Hub-Styles
│   ├── js/                  # Editor-SPA, Hub-SPA
│   └── images/              # App-Icon
├── renderer/
│   ├── page_renderer.py     # Öffentliche Seiten ausliefern
│   └── cache.py             # Redis-Cache-Verwaltung
├── templates/
│   └── grapebuild_base.html # Standalone-Base-Template (kein Frappe Desk)
├── tests/
│   └── test_m0.py           # Automatische Tests
├── www/
│   └── grapebuild/
│       ├── hub.html / hub.py
│       └── editor.html / editor.py
└── hooks.py                 # App-Konfiguration, page_renderer, fixtures
```

### Lizenz

MIT — siehe [license.txt](license.txt)
