import { showLoader, hideLoader } from './modules/loader/loader.js';
import { fetchIPData } from './modules/tracker/iptracker.js';
import {
    loadLanguagePacks,
    selectLanguagePack,
    loadSelectedLanguagePack
} from './modules/loader/contentManager.js';
import { createModule, insertContentFromPack } from './modules/loader/contentBuilder.js';

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
        if (loader) showLoader(parentElem);
    } else {
        if (loader) showLoader(document.body);
    }

    try {
        let data = task ? await task() : null;

        if (transform) {
            data = await transform(data); // z.B. ContentManager → richtige JSON finden
        }

        hideLoader();

        if (build) {
            const built = build(data, parentElem);

            // Falls Builder DOM direkt einfügt (wie ContentBuilder)
            if (built === undefined || built === null) {
                return;
            }

            if (parentElem !== document.body) {
                parentElem.innerHTML = built;
            } else {
                parentElem.insertAdjacentHTML("beforeend", built);
            }
        } else {
            parentElem.innerText = JSON.stringify(data);
        }
    } catch (err) {
        hideLoader();
        if (parentElem !== document.body) {
            parentElem.innerHTML = "⚠️ Fehler beim Laden";
        } else {
            parentElem.insertAdjacentHTML("beforeend", "<p>⚠️ Fehler beim Laden</p>");
        }
        console.error(err);
    }
}

// ---------------------------------
// Content:
// ---------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Beispiel 1: IP
    sitebuilder({
        target: "01",
        placeholder: "Lade IP...",
        task: fetchIPData,
        build: (data) => `
            Deine IP: ${data.ip}<br>
            Land: ${data.country}<br>
            Provider: ${data.isp}
        `
    });

    // ContentBuilder Modul:
    sitebuilder({
        target: "dynamic-content",
        placeholder: "Lade Content...",
        task: () => loadLanguagePacks("./packs/programContentmanager.json"),
        transform: (packs) => {
            const selected = selectLanguagePack(packs.content, "de", "homepage");
            return loadSelectedLanguagePack(selected.link);
        },
        build: (data, parentElem) => {
            insertContentFromPack(data, parentElem.id); // ContentBuilder übernimmt Rendering
        }
    });
});
