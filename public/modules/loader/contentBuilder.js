// contentBuilder.js
import { startProcess, endProcess } from './loader.js';

export function createModule(meta, content) {
    const wrapper = document.createElement("div");
    wrapper.id = meta.id || "";

    function createElement(item) {
        const el = document.createElement(item.type);

        if (item.attributes) {
            Object.entries(item.attributes).forEach(([attr, val]) => {
                el.setAttribute(attr, val);
            });
        }
        if (item.text) el.innerText = item.text;

        if (item.children) {
            item.children.forEach(child => el.appendChild(createElement(child)));
        }
        return el;
    }

    content.forEach(item => wrapper.appendChild(createElement(item)));
    return wrapper;
}

export function insertContentFromPack(content, targetId) {
    const container = typeof targetId === "string"
        ? document.getElementById(targetId)
        : targetId;

    if (!container) {
        console.error(`Container "${targetId}" nicht gefunden`);
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
            container.innerHTML = `<p>${JSON.stringify(content)}</p>`;
        }
    } finally {
        endProcess(`insertContent:${targetId}`);
    }
}
