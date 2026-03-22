frappe.pages["grapebuild-builder"].on_page_load = function () {
    var pageName = frappe.utils.get_url_arg("page") || "";
    if (pageName) {
        window.location.href = "/grapebuild/editor?page=" + encodeURIComponent(pageName);
    } else {
        window.location.href = "/grapebuild/hub";
    }
};
