// contentBuilder.js
import { startProcess, endProcess } from './loader.js';

/**
 * Erstellt DOM-Elemente aus JSON-Beschreibung
 */
export function createModule(meta, content) {
    const wrapper = document.createElement("div");
    wrapper.id = meta.id || "";

    function createElement(item) {
        let el;

        switch (item.type) {
            case "tileset":
                // Tileset dynamisch laden
                el = document.createElement("div");
                const mountId = item.props?.mount;
                let mountElem = mountId ? wrapper.querySelector(`#${mountId}`) : null;

                // Optional: Div automatisch erstellen
                if (!mountElem && mountId && item.props?.autoMountDiv) {
                    mountElem = document.createElement("div");
                    mountElem.id = mountId;
                    wrapper.appendChild(mountElem);
                    console.log(`ℹ️ Tileset mountpoint "${mountId}" automatisch erstellt`);
                }

                if (!mountElem) {
                    console.warn(`⚠️ Tileset mountpoint "${mountId}" nicht gefunden`);
                    break;
                }

                // JSON Tileset laden und einfügen
                if (item.props?.link) {
                    fetch(item.props.link)
                        .then(r => r.json())
                        .then(json => {
                            insertContentFromPack(json, mountElem);
                        })
                        .catch(err => console.error(`❌ Fehler beim Laden des Tilesets: ${item.props.link}`, err));
                }
                break;

            case "script":
                el = document.createElement("script");
                if (item.module) el.type = "module";
                if (item.text) el.textContent = item.text;
                break;

            default:
                el = document.createElement(item.type);
                if (item.attributes) {
                    Object.entries(item.attributes).forEach(([attr, val]) => {
                        if (Array.isArray(val)) {
                            el.setAttribute(attr, val.join(" "));
                        } else {
                            el.setAttribute(attr, val);
                        }
                    });
                }
                if (item.text) el.innerText = item.text;
                if (item.children) {
                    item.children.forEach(child => el.appendChild(createElement(child)));
                }
                break;
        }

        return el;
    }

    content.forEach(item => wrapper.appendChild(createElement(item)));
    return wrapper;
}

/**
 * Fügt JSON-Content in einen Container ein
 */
export async function insertContentFromPack(content, target) {
    const container = typeof target === "string" ? document.getElementById(target) : target;
    if (!container) throw new Error(`❌ Kein Container gefunden für "${target}"`);

    startProcess(`insertContent:${target}`);
    try {
        container.innerHTML = "";

        if (content.modules && Array.isArray(content.modules)) {
            for (const module of content.modules) {
                const { meta, content: moduleContent } = module;
                const moduleHTML = createModule(meta, moduleContent);
                container.appendChild(moduleHTML);
            }
        } else {
            container.innerHTML = `<p>${JSON.stringify(content)}</p>`;
        }
    } finally {
        endProcess(`insertContent:${target}`);
    }
}
