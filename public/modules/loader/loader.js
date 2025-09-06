// loader.js

// Zeigt Loader an (im Container, Body oder zentriert)
export function showLoader(target) {
    let loader = document.createElement("div");
    loader.className = "loader";
    hideLoader(); // verhindert doppelte Loader

    if (typeof target === "string") {
        if (target === "center") {
            loader.style.position = "fixed";
            loader.style.left = "50%";
            loader.style.top = "50%";
            loader.style.transform = "translate(-50%, -50%)";
            loader.style.zIndex = "10000";
            document.body.appendChild(loader);
        } else if (target === "body") {
            document.body.appendChild(loader);
        } else {
            let parentElem = document.getElementById(target);
            if (parentElem) parentElem.appendChild(loader);
            else document.body.appendChild(loader);
        }
    } else if (target instanceof HTMLElement) {
        target.appendChild(loader);
    } else {
        document.body.appendChild(loader);
    }
}

// Entfernt alle Loader
export function hideLoader() {
    document.querySelectorAll(".loader").forEach(loader => loader.remove());
}
