import frappe
from frappe.tests.utils import FrappeTestCase

TEST_SLUGS = ["test-m0-seite", "test-m0-duplikat"]


def _cleanup():
    for slug in TEST_SLUGS:
        name = frappe.db.get_value("GrapeBuild Page", {"slug": slug}, "name")
        if name:
            frappe.delete_doc("GrapeBuild Page", name, force=True)
    frappe.db.commit()


class TestM0(FrappeTestCase):
    """M0 Fundament Tests"""

    def setUp(self):
        frappe.set_user("Administrator")
        _cleanup()

    def tearDown(self):
        _cleanup()

    def test_create_page(self):
        from grapebuild.api.page_api import create_page

        result = create_page("Test M0 Seite", "test-m0-seite")
        self.assertIn("name", result)
        self.assertEqual(result["slug"], "test-m0-seite")
        self.assertTrue(frappe.db.exists("GrapeBuild Page", {"slug": "test-m0-seite"}))

    def test_slug_collision(self):
        from grapebuild.api.page_api import create_page

        create_page("Test M0 Seite", "test-m0-seite")
        with self.assertRaises(frappe.ValidationError):
            create_page("Duplikat", "test-m0-seite")

    def test_save_and_load_page(self):
        from grapebuild.api.page_api import create_page, load_page, save_page

        r = create_page("Test M0 Seite", "test-m0-seite")
        page_name = r["name"]

        save_result = save_page(page_name, '{"pages":[{"frames":[]}]}')
        self.assertTrue(save_result["success"])

        loaded = load_page(page_name)
        self.assertEqual(loaded["slug"], "test-m0-seite")
        self.assertIn("gjs_data", loaded)

    def test_sanitize_html(self):
        from grapebuild.utils import sanitize_html

        dirty = '<p>OK</p><script>alert(1)</script><img onload="alert(2)" src="x">'
        clean = sanitize_html(dirty)
        self.assertNotIn("<script>", clean)
        self.assertNotIn("onload", clean)
        self.assertIn("<p>OK</p>", clean)

    def test_list_pages(self):
        from grapebuild.api.page_api import create_page, list_pages

        create_page("Test M0 Seite", "test-m0-seite")
        pages = list_pages()
        self.assertIsInstance(pages, list)
        slugs = [p["slug"] for p in pages]
        self.assertIn("test-m0-seite", slugs)
