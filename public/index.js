// index.js
import { ConsentManager } from './modules/consent/consentManager.js';
import { setManager } from './modules/consent/consentApi.js';
import { loadContentFromURL, insertContentFromPack } from './modules/loader/contentManager.js';
import { startProcess, endProcess } from './modules/loader/loader.js';

// index.js (unterhalb imports einfügen)
window.sitebuilder = async function sitebuilder({
                                                    target,
                                                    loader = true,
                                                    placeholder = "",
                                                    task,      // Funktion die Daten beschafft
                                                    transform, // optional: Daten verarbeiten
                                                    build      // Funktion die DOM erzeugt / HTML string zurückgibt
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

    if (loader) startProcess(`sitebuilder-${target}`, { design: "default", target: "center" });

    if (parentElem !== document.body && placeholder) {
        parentElem.innerHTML = placeholder;
    }

    try {
        let data = task ? await task() : null;
        if (transform) data = await transform(data);

        endProcess(`sitebuilder-${target}`);

        if (build) {
            const built = build(data, parentElem);
            if (built === undefined || built === null) return;

            if (parentElem !== document.body) {
                parentElem.innerHTML = built;
            } else {
                parentElem.insertAdjacentHTML("beforeend", built);
            }
        } else {
            parentElem.innerText = JSON.stringify(data);
        }
    } catch (err) {
        endProcess(`sitebuilder-${target}`);
        if (parentElem !== document.body) {
            parentElem.innerHTML = "⚠️ Fehler beim Laden";
        } else {
            parentElem.insertAdjacentHTML("beforeend", "<p>⚠️ Fehler beim Laden</p>");
        }
        console.error(err);
    }
};


(async function initApp() {
    startProcess("initApp");

    try {
        // --------------------------
        // Region & Sprache bestimmen
        // --------------------------
        const region = "eu"; // TODO: dynamisch via GeoIP
        const lang = "de";   // TODO: dynamisch via Browser

        // --------------------------
        // ConsentManager laden
        // --------------------------
        const manager = new ConsentManager({ region, language: lang });
        await manager.loadPolicy();
        setManager(manager);

        console.log("✅ ConsentManager geladen:", manager.getStatus());

        // --------------------------
        // App-Container sicherstellen
        // --------------------------
        let appContainer = document.getElementById("app");
        if (!appContainer) {
            appContainer = document.createElement("div");
            appContainer.id = "app";
            document.body.appendChild(appContainer);
            console.log("ℹ️ #app automatisch erzeugt");
        }

        // --------------------------
        // Content Packs laden (Seite selbst)
        // --------------------------
        const pageContent = await loadContentFromURL("./packs/programContentmanager.json");
        insertContentFromPack(pageContent, "app"); // jetzt sicher vorhanden

        // --------------------------
        // Tilesets laden (Quick Consent)
        // --------------------------
        try {
            const quickTileset = await fetch("./packs/global/tilesets/policy/quick.json").then(r => r.json());
            insertContentFromPack(quickTileset, "consent-container");
        } catch (err) {
            console.warn("⚠️ Kein consent-container im DOM vorhanden – wird ggf. per JSON erzeugt.");
        }

        // --------------------------
        // Event: Extended Consent laden
        // --------------------------
        document.addEventListener("consent:showExtended", async () => {
            console.log("ℹ️ Extended Consent Tileset laden...");
            const extendedTileset = await fetch("./packs/global/tilesets/policy/extended.json").then(r => r.json());
            insertContentFromPack(extendedTileset, "consent-container");
        });

        // --------------------------
        // Features starten (falls Zustimmung gespeichert)
        // --------------------------
        await manager.runEnabledFeatures();

    } catch (err) {
        console.error("❌ Fehler beim Initialisieren:", err);
    } finally {
        endProcess("initApp");
    }
})();
