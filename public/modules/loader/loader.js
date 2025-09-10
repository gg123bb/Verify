let activeProcesses = new Set();       // alle Prozesse (inkl. silent)
let visualProcesses = new Set();       // nur Prozesse, die Loader sichtbar machen
let listeners = [];

/**
 * Startet einen Prozess (visuell oder nur dokumentarisch).
 */
export function startProcess(
    name = "default",
    {
        silent = false,
        design = "default", // "default" | "picture" | "class"
        target = "center",
        picture = null,
        cssClass = null,
        rotate = true
    } = {}
) {
    activeProcesses.add(name);
    notifyListeners();

    if (silent) return; // nur dokumentieren → kein UI

    visualProcesses.add(name);

    // Wenn Loader schon sichtbar → nichts tun
    if (document.querySelector(".loader-wrapper")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "loader-wrapper";

    let loaderElement;

    switch (design) {
        case "picture":
            loaderElement = document.createElement("img");
            loaderElement.src = picture || "default-loader.png";
            loaderElement.classList.add("loader-picture");
            break;

        case "class":
            loaderElement = document.createElement("div");
            if (cssClass) {
                if (Array.isArray(cssClass)) {
                    loaderElement.classList.add(...cssClass);
                } else {
                    loaderElement.className = cssClass; // string → alle Klassen drin
                }
            } else {
                loaderElement.className = "loader-custom";
            }
            break;

        default: // Standard-Spinner
            loaderElement = document.createElement("div");
            loaderElement.className = "loader-spinner";
    }

    if (rotate) {
        loaderElement.classList.add("rotate");
    }

    wrapper.appendChild(loaderElement);

    // Positionieren
    if (typeof target === "string") {
        if (target === "center") {
            wrapper.classList.add("loader-center");
            document.body.appendChild(wrapper);
        } else if (target === "body") {
            document.body.appendChild(wrapper);
        } else {
            const parentElem = document.getElementById(target);
            if (parentElem) parentElem.appendChild(wrapper);
            else document.body.appendChild(wrapper);
        }
    } else if (target instanceof HTMLElement) {
        target.appendChild(wrapper);
    } else {
        document.body.appendChild(wrapper);
    }
}

/**
 * Beendet einen Prozess.
 */
export function endProcess(name = "default") {
    activeProcesses.delete(name);
    visualProcesses.delete(name);
    notifyListeners();

    if (visualProcesses.size === 0) {
        hideLoader();
    }
}

/**
 * Entfernt alle Loader sofort.
 */
export function hideLoader() {
    document.querySelectorAll(".loader-wrapper").forEach(loader => loader.remove());
    visualProcesses.clear();
    notifyListeners();
}

/**
 * Aktive Prozesse (alle, inkl. silent).
 */
export function getActiveProcesses() {
    return [...activeProcesses];
}

/**
 * Debug: zeigt alle aktiven Prozesse in der Konsole.
 */
export function debugProcesses() {
    console.log("🔎 Aktive Prozesse:", getActiveProcesses());
    console.log("💡 Sichtbare Prozesse:", [...visualProcesses]);
}

/**
 * Listener registrieren.
 */
export function onProcessChange(callback) {
    if (typeof callback === "function") {
        listeners.push(callback);
    }
}

function notifyListeners() {
    const processes = getActiveProcesses();
    listeners.forEach(cb => cb(processes));
}
