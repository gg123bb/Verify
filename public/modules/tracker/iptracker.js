// ipTracker.js

// Funktion nur für die Daten-Logik
export async function fetchIPData() {
    try {
        const response = await fetch('/ip-api');
        const data = await response.json();
        return {
            ip: data.query || data.ip || "unbekannt",
            country: data.country || "unbekannt",
            isp: data.isp || "unbekannt"
        };
    } catch (e) {
        return {
            ip: "Fehler",
            country: "unbekannt",
            isp: "unbekannt"
        };
    }
}
