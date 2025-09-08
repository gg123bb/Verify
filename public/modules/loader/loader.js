// loader.js

let activeProcesses = new Set();

/**
 * Zeigt Loader an (zentriert oder in einem Target).
 * Aber: wird nur entfernt, wenn wirklich keine Prozesse mehr laufen.
 */
export function startProcess(name = "default", target = "center") {
    activeProcesses.add(name);

    // Wenn Loader schon sichtbar → nichts tun
    if (document.querySelector(".loader")) return;

    const loader = document.createElement("div");
    loader.className = "loader";

    if (typeof target === "string") {
        if (target === "center") {
            loader.style.position = "fixed";
            loader.style.left = "50%";
            loader.style.top = "50%";
            loader.style.transform = "translate(-50%, -50%)";
            loader.style.zIndex = "10000";
            loader.classList.add("loader-center"); // extra Klasse für zentrierten Loader
            document.body.appendChild(loader);
        } else if (target === "body") {
            document.body.appendChild(loader);
        } else {
            const parentElem = document.getElementById(target);
            if (parentElem) parentElem.appendChild(loader);
            else document.body.appendChild(loader);
        }
    } else if (target instanceof HTMLElement) {
        target.appendChild(loader);
    } else {
        document.body.appendChild(loader);
    }
}

/**
 * Beendet einen Prozess. Loader bleibt sichtbar, solange noch andere laufen.
 */
export function endProcess(name = "default") {
    activeProcesses.delete(name);

    if (activeProcesses.size === 0) {
        hideLoader();
    }
}

/**
 * Fallback: entfernt sofort alle Loader
 */
export function hideLoader() {
    document.querySelectorAll(".loader").forEach(loader => loader.remove());
    activeProcesses.clear();
}

/**
 * Debug: zeigt alle aktiven Prozesse in der Konsole
 */
export function debugProcesses() {
    console.log("🔎 Aktive Loader-Prozesse:", [...activeProcesses]);
}
