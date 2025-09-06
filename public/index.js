// Zeigt die IP-Infos im Div mit ID "01"
function ipinfobuild(ip, country, isp) {
    let text = `Deine IP: ${ip}\nLand: ${country}\nProvider: ${isp}`;
    let elem = document.getElementById("01");
    if (!elem) {
        elem = document.createElement("div");
        elem.id = "01";
        elem.className = "build";
        document.body.appendChild(elem);
    }
    elem.innerText = text;
}

// Zeigt Loader an (im Container, Body oder zentriert)
function showLoader(target) {
    let loader = document.createElement("div");
    loader.className = "loader";
    removeLoader();
    if (typeof target === "string") {
        if (target === "center") {
            loader.style.position = "fixed";
            loader.style.left = "50%";
            loader.style.top = "50%";
            loader.style.transform = "translate(-50%, -50%)";
            loader.style.zIndex = "10000";
            document.body.appendChild(loader);
        } else if (target === "body") {
            document.body.appendChild(loader);
        } else {
            let parentElem = document.getElementById(target);
            if (parentElem) parentElem.appendChild(loader);
            else document.body.appendChild(loader);
        }
    } else if (target instanceof HTMLElement) {
        target.appendChild(loader);
    } else {
        document.body.appendChild(loader);
    }
}

// Entfernt alle Loader!
function removeLoader() {
    document.querySelectorAll(".loader").forEach(loader => loader.remove());
}

// NEU: Baut beliebigen Content und interagiert immer mit dem Loader
function sitebuilder({target, loader = true, content = ""}) {
    if (loader) showLoader(target);
    // "Fake" loading, damit Loader sichtbar ist (sonst zu schnell weg)
    setTimeout(() => {
        removeLoader();
        let parentElem = typeof target === "string"
            ? document.getElementById(target)
            : target instanceof HTMLElement
                ? target
                : document.body;
        if (!parentElem) {
            parentElem = document.body;
        }
        // Content kann beliebiger Text oder HTML sein!
        parentElem.innerHTML = content;
    }, 700); // Loader bleibt 0.5s sichtbar
}

// Holt IP-Daten und zeigt sie an
async function loadIP() {
    // Zeigt Loader im Div "01" und wartet auf Daten
    sitebuilder({target: "01", loader: true, content: ""});
    try {
        const response = await fetch('/ip-api');
        const data = await response.json();
        sitebuilder({
            target: "01",
            loader: true,
            content: `Deine IP: ${data.query || data.ip}<br>Land: ${data.country}<br>Provider: ${data.isp}`
        });
    } catch (e) {
        sitebuilder({
            target: "01",
            loader: true,
            content: "Fehler<br>unbekannt<br>unbekannt"
        });
    }
}

// Initialanzeige
function siteloading() {
    sitebuilder({target: "01", loader: true, content: "Lade IP..."});
}

document.addEventListener('DOMContentLoaded', async function () {
    siteloading();
    await loadIP();
});

/*
// Beispiel für Interaktion: Zeigt Loader beim Klick
// Ist für Devs wenn ihr am Loader arbeitet könnt ihr mit einem klick den Loader auslösen.

document.addEventListener('click', function (e) {
    sitebuilder({target: "center", loader: true, content: "<b>Klick erkannt!</b>"});
});

*/