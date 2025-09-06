const express = require('express');
const fs = require('fs');
const router = express.Router();

// API-Endpunkt für IP-Tracking
router.get('/ip-api', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    //hier wird die text datei erstellt. villt später ändern.
    fs.appendFileSync('ips.txt', ip + '\n');
    res.json({ success: true, ip });
});

module.exports = router;