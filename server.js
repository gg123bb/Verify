const express = require('express');
const path = require('path');
const os = require('os'); // für IP-Ermittlung
const ipApiRouter = require('./ip-api/ip'); // Pfad anpassen!

const app = express();

// Statische Dateien aus /public
app.use(express.static(path.join(__dirname, 'public')));

// IP-API einbinden
app.use(ipApiRouter);

// 404-Seite am Ende
app.use((req, res) => {
    res.status(404);
    res.sendFile(path.join(__dirname, 'public', './404/404.html'));
});

const PORT = 3000;

// Funktion zur Ermittlung aller lokalen IP-Adressen
function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push(iface.address);
            }
        }
    }
    return addresses.length > 0 ? addresses : ['localhost'];
}

const localIPs = getLocalIPs();

app.listen(PORT, () => {
    console.log(` `);
    console.log(`Welcome to Verify,`);
    console.log(``);
    console.log(`server runs on:`);
    console.log(`→ http://localhost:${PORT}`);
    localIPs.forEach(ip => {
        console.log(`→ http://${ip}:${PORT}`);
    });
    console.log(`→ ctrl + C stopp server in the Terminal`);
    console.log(``);
    console.log(`Happy Coding!\n`);
});
