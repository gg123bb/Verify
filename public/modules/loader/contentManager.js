// contentManager.js
import { createModule } from './contentBuilder.js';
import { getURLParams } from '../tracker/urlTracker.js';
import { startProcess, endProcess } from './loader.js';

/**
 * Inhalte in einen Container einfügen
 */
export async function insertContentFromPack(content, targetId = "dynamic-content") {
    const container = typeof targetId === "string"
        ? document.getElementById(targetId)
        : targetId;

    if (!container) throw new Error(`❌ Kein Container mit ID "${targetId}" gefunden`);

    startProcess(`insertContent:${targetId}`);
    try {
        container.innerHTML = '';

        if (content.modules && Array.isArray(content.modules)) {
            for (const module of content.modules) {
                const { meta, content: moduleContent } = module;
                const moduleHTML = createModule(meta, moduleContent);
                container.appendChild(moduleHTML);
            }
        } else {
            container.innerHTML = `<pre>${JSON.stringify(content, null, 2)}</pre>`;
        }
    } finally {
        endProcess(`insertContent:${targetId}`);
    }
}

/**
 * Sprachpakete JSON laden
 */
export async function loadLanguagePacks(link) {
    if (!link) throw new Error("❌ Kein Link für das Sprachpaket bereitgestellt.");
    startProcess("loadLanguagePacks");
    try {
        const resp = await fetch(link);
        return await resp.json();
    } finally {
        endProcess("loadLanguagePacks");
    }
}

/**
 * Sprachpaket auswählen (Sprache, Kategorie, Datum, Priority, Privacy)
 */
export function selectLanguagePack(packs, lang, category) {
    const now = new Date();

    const filtered = packs.filter(pack => {
        const startDate = (pack.start && pack.start !== "true") ? new Date(pack.start) : null;
        const endDate   = (pack.end && pack.end !== "false") ? new Date(pack.end) : null;
        const isPrivate = pack.private === "true";

        return (
            pack.lang.toLowerCase() === lang.toLowerCase() &&
            !isPrivate &&
            (pack.start === "true" || !startDate || now >= startDate) &&
            (!endDate || now <= endDate) &&
            (!category || pack.category === category)
        );
    });

    filtered.sort((a,b) => b.priority - a.priority);
    return filtered[0] || null;
}

/**
 * Sprachpaket-Inhalt laden (aus JSON-Link)
 */
export async function loadSelectedLanguagePack(packURL) {
    if (!packURL) throw new Error("❌ Keine URL für Sprachpaket angegeben.");
    startProcess("loadSelectedLanguagePack");
    try {
        const resp = await fetch(packURL);
        return await resp.json();
    } finally {
        endProcess("loadSelectedLanguagePack");
    }
}

/**
 * Content anhand URL laden und korrekt auswählen
 */
export async function loadContentFromURL(path) {
    const params = getURLParams();
    const lang = params.lang || "de";
    const page = params.page || "homepage";

    startProcess("loadContentFromURL");
    try {
        const packs = await loadLanguagePacks(path);
        const selected = selectLanguagePack(packs.content, lang, page);
        if (!selected) throw new Error(`❌ Kein ContentPack für lang="${lang}" und page="${page}" gefunden.`);

        return await loadSelectedLanguagePack(selected.link);
    } finally {
        endProcess("loadContentFromURL");
    }
}
