import { createModule } from './contentBuilder.js';
import { getURLParams } from '../tracker/urlTracker.js';

/**
 * Sprachpakete JSON laden
 */
export async function loadLanguagePacks(link) {
    if (!link) throw new Error("❌ Kein Link für das Sprachpaket bereitgestellt.");
    const response = await fetch(link);
    return response.json();
}

/**
 * Sprachpaket auswählen (Sprache, Kategorie, Datum, Priority, Privacy)
 */
export function selectLanguagePack(languagePacks, userLang, category) {
    const now = new Date();

    const filtered = languagePacks.filter(pack => {
        const startDate = (pack.start && pack.start !== "true") ? new Date(pack.start) : null;
        const endDate   = (pack.end && pack.end !== "false") ? new Date(pack.end) : null;
        const isPrivate = pack.private === "true";

        return (
            pack.lang === userLang &&
            !isPrivate &&
            (pack.start === "true" || !startDate || now >= startDate) &&
            (!endDate || now <= endDate) &&
            (!category || pack.category === category)
        );
    });

    filtered.sort((a, b) => b.priority - a.priority);

    return filtered[0] || null;
}

/**
 * Sprachpaket-Inhalt laden (aus JSON-Link)
 */
export async function loadSelectedLanguagePack(packURL) {
    if (!packURL) throw new Error("❌ Keine URL für Sprachpaket angegeben.");
    const response = await fetch(packURL);
    return response.json();
}

/**
 * Content in ein Ziel-DIV einfügen
 */
export async function insertContentFromPack(content, targetId = "dynamic-content") {
    const container = document.getElementById(targetId);
    if (!container) throw new Error(`❌ Kein Container mit ID "${targetId}" gefunden.`);

    container.innerHTML = '';

    if (content.modules && Array.isArray(content.modules)) {
        for (const module of content.modules) {
            const { meta, content: moduleContent } = module;
            const moduleHTML = createModule(meta, moduleContent);
            container.appendChild(moduleHTML);
        }
    } else {
        container.innerHTML = `<p>${JSON.stringify(content)}</p>`;
    }
}

/**
 * Content anhand von URL-Parametern laden
 * Beispiel: ?lang=de&page=homepage
 */
export async function loadContentFromURL(path) {
    const params = getURLParams();

    const lang = params.lang || "de";       // Default: deutsch
    const page = params.page || "homepage"; // Default: homepage

    const packs = await loadLanguagePacks(path);
    const selected = selectLanguagePack(packs.content, lang, page);

    if (!selected) {
        throw new Error(`❌ Kein ContentPack für lang="${lang}" und page="${page}" gefunden.`);
    }

    return loadSelectedLanguagePack(selected.link);
}
