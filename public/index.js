// index.js
import { ConsentManager } from './modules/consent/consentManager.js';
import { setManager } from './modules/consent/consentApi.js';
import { loadContentFromURL, insertContentFromPack } from './modules/loader/contentManager.js';
import { startProcess, endProcess, debugProcesses } from './modules/loader/loader.js';

// --------------------------
// Sitebuilder global verfügbar machen
// --------------------------
window.sitebuilder = async function sitebuilder({
                                                    target,
                                                    loader = true,
                                                    placeholder = "",
                                                    task,      // Funktion die Daten beschafft
                                                    transform, // optional: Daten verarbeiten
                                                    build      // Funktion die DOM erzeugt / HTML string zurückgibt
                                                }) {
    let parentElem = typeof target === "string" ? document.getElementById(target) : target;

    if (!parentElem) {
        console.warn(`⚠️ Sitebuilder: Target "${target}" nicht gefunden. Neues DIV wird erstellt.`);
        parentElem = document.createElement("div");
        parentElem.id = target || "sitebuilder-root";
        document.body.appendChild(parentElem);
    }

    if (loader) startProcess(`sitebuilder-${target}`, { design: "default", target: "center" });

    if (parentElem !== document.body && placeholder) parentElem.innerHTML = placeholder;

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

// --------------------------
// Init App
// --------------------------
(async function initApp() {
    startProcess("loader", { design: "default", target: "center" });

    try {
        // --------------------------
        // App-Container erstellen
        // --------------------------
        let appContainer = document.getElementById("app");
        if (!appContainer) {
            appContainer = document.createElement("div");
            appContainer.id = "app";
            document.body.appendChild(appContainer);
            console.log("ℹ️ #app automatisch erzeugt");
        }
        appContainer.innerHTML = "<p>Lädt…</p>";

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
        // Content Packs laden (Seite selbst)
        // --------------------------
        const pageContent = await loadContentFromURL("./packs/programContentmanager.json");
        await insertContentFromPack(pageContent, "app");

        // --------------------------
        // Features starten (falls Zustimmung gespeichert)
        // --------------------------
        await manager.runEnabledFeatures();

    } catch (err) {
        console.error("❌ Fehler beim Initialisieren:", err);
        if (appContainer) appContainer.innerHTML = "<p>⚠️ Fehler beim Laden der App</p>";
    } finally {
        endProcess("loader");
        debugProcesses(); // Optional: alle Loader-Debugs anzeigen
    }
})();
