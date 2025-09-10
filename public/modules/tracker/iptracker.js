// tracker/ipTracker.js
export async function run() {
    try {
        const response = await fetch("/ip-api");
        const data = await response.json();
        console.log("📡 IP-Daten:", {
            ip: data.query || data.ip || "unbekannt",
            country: data.country || "unbekannt",
            isp: data.isp || "unbekannt"
        });
    } catch (e) {
        console.error("❌ Fehler beim IP-Tracker", e);
    }
}
