import { startProcess, endProcess, debugProcesses } from './modules/loader/loader.js';
import { fetchIPData } from './modules/tracker/iptracker.js';
import {
    loadContentFromURL,
    insertContentFromPack, // ✅ nur hier importieren
} from './modules/loader/contentManager.js';
import { createModule } from './modules/loader/contentBuilder.js'; // ✅ kein doppelter Import


// Universeller Sitebuilder
async function sitebuilder({
                               target,
                               loader = true,
                               placeholder = "",
                               task,      // = Funktion die Daten beschafft
                               transform, // = Daten verarbeiten (optional)
                               build      // = Funktion die DOM erzeugt / HTML string zurückgibt
                           }) {
    let parentElem = typeof target === "string"
        ? document.getElementById(target)
        : target;

    if (!parentElem) {
        console.warn(`⚠️ Sitebuilder: Target "${target}" nicht gefunden. Neues DIV wird erstellt.`);
        parentElem = document.createElement("div");
        parentElem.id = target || "sitebuilder-root";
        document.body.appendChild(parentElem);
    }

    if (parentElem !== document.body) {
        parentElem.innerHTML = placeholder;
    }

    const processName = `sitebuilder:${parentElem.id || "root"}`;
    if (loader) startProcess(processName);

    try {
        let data = task ? await task() : null;
        if (transform) {
            data = await transform(data);
        }

        if (build) {
            const built = build(data, parentElem);

            if (built !== undefined && built !== null) {
                if (parentElem !== document.body) {
                    parentElem.innerHTML = built;
                } else {
                    parentElem.insertAdjacentHTML("beforeend", built);
                }
            }
        } else {
            parentElem.innerText = JSON.stringify(data);
        }
    } catch (err) {
        if (parentElem !== document.body) {
            parentElem.innerHTML = "⚠️ Fehler beim Laden";
        } else {
            parentElem.insertAdjacentHTML("beforeend", "<p>⚠️ Fehler beim Laden</p>");
        }
        console.error(err);
    } finally {
        if (loader) endProcess(processName);
    }
}


// ---------------------------------
// Beispiele
// ---------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Beispiel 1: IP
    sitebuilder({
        target: "01",
        placeholder: "Lade IP...",
        task: fetchIPData,
        build: (data) => `
            your ip: ${data.ip}<br>
            land: ${data.country}<br>
            provider: ${data.isp}
        `
    });

    // Beispiel 2: Content
    sitebuilder({
        target: "dynamic-content",
        placeholder: "Lade Content...",
        task: () => loadContentFromURL("./packs/programContentmanager.json"),
        build: (data, parentElem) => {
            insertContentFromPack(data, parentElem.id); // rendert Module
        }
    });

    // Debug-Loader dauerhaft sichtbar
    //startProcess("debug");
    debugProcesses(); // zeigt im Log an, wer gerade läuft
});
