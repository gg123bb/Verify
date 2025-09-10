// contentBuilder.js
import { startProcess, endProcess } from './loader.js';

export function createModule(meta, content) {
    const wrapper = document.createElement("div");
    wrapper.id = meta.id || "";

    function createElement(item) {
        let el;

        if (item.type === "script") {
            el = document.createElement("script");
            el.type = "module"; // zwingt Browser, Script als ES Modul zu interpretieren
            el.textContent = item.text || "";
        } else if (item.type === "tileset") {
            el = document.createElement("div");
            el.id = `tileset-${item.name}-${meta.id || Math.random().toString(36).substr(2,5)}`;
            el.dataset.tileset = item.name;
            el.dataset.mode = item.mode || "default";
            if (item.props) Object.entries(item.props).forEach(([k,v]) => el.dataset[k] = v);
        } else {
            el = document.createElement(item.type);
            if (item.attributes) {
                Object.entries(item.attributes).forEach(([attr, val]) => el.setAttribute(attr, val));
            }
            if (item.text) el.innerText = item.text;
        }

        if (item.children) {
            item.children.forEach(child => el.appendChild(createElement(child)));
        }

        return el;
    }

    content.forEach(item => wrapper.appendChild(createElement(item)));
    return wrapper;
}

export function insertContentFromPack(content, targetId = "dynamic-content") {
    const container = typeof targetId === "string"
        ? document.getElementById(targetId)
        : targetId;

    if (!container) {
        console.error(`❌ Container "${targetId}" nicht gefunden`);
        return;
    }

    startProcess(`insertContent:${targetId}`);
    try {
        container.innerHTML = '';

        if (content.modules && Array.isArray(content.modules)) {
            content.modules.forEach(module => {
                const moduleHTML = createModule(module.meta, module.content);
                container.appendChild(moduleHTML);
            });
        } else {
            container.innerHTML = `<pre>${JSON.stringify(content, null, 2)}</pre>`;
        }
    } finally {
        endProcess(`insertContent:${targetId}`);
    }
}
