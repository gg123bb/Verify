// contentManager.js
import { createModule } from './contentBuilder.js';

// Sprachpakete JSON laden
export async function loadLanguagePacks(link) {
    if (!link) throw new Error("Kein Link für das Sprachpaket bereitgestellt.");
    const response = await fetch(link);
    return response.json();
}

// Sprachpaket auswählen nach Sprache, Kategorie etc.
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

// Sprachpaket-Inhalt laden
export async function loadSelectedLanguagePack(packURL) {
    const response = await fetch(packURL);
    return response.json();
}

// Content ins DOM einfügen
export async function insertContentFromPack(content, targetId = "dynamic-content") {
    const container = document.getElementById(targetId);
    if (!container) throw new Error(`Kein Container mit ID ${targetId} gefunden`);

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
