// modules/consent/consentManager.js
import { startProcess, endProcess } from '../loader/loader.js';

export class ConsentManager {
    constructor(options = {}) {
        this.region = options.region || "eu";
        this.language = options.language || "de";

        // Policy & Sprachpfade automatisch bauen
        this.policyPath = `./modules/consent/${this.region}/policy.json`;
        this.languagePath = `./packs/lang/${this.language}/policy/${this.language}-consent.json`;

        this.policy = null;
        this.languagePack = null;
        this.consents = JSON.parse(localStorage.getItem("consents") || "{}");

        console.log("ConsentManager init:", {
            region: this.region,
            language: this.language,
            policyPath: this.policyPath,
            languagePath: this.languagePath
        });
    }

    async loadPolicy() {
        if (!this.policyPath || !this.languagePath) {
            throw new Error("Policy- oder Sprachpfad nicht gesetzt.");
        }

        startProcess("ConsentManager.loadPolicy");
        try {
            const policy = await fetch(this.policyPath).then(r => r.json());
            const languagePack = await fetch(this.languagePath).then(r => r.json());

            this.policy = policy;
            this.languagePack = languagePack;

            console.log("✅ Policy & LanguagePack geladen");
        } finally {
            endProcess("ConsentManager.loadPolicy");
        }
    }

    getStatus() {
        return {
            region: this.region,
            language: this.language,
            consents: this.consents,
            policy: !!this.policy,
            languagePack: !!this.languagePack
        };
    }

    hasConsented(key) {
        return !!this.consents[key];
    }

    setConsent(key, value) {
        this.consents[key] = value;
        localStorage.setItem("consents", JSON.stringify(this.consents));
    }

    async runEnabledFeatures() {
        if (!this.policy || !this.policy.features) return;

        for (const feature of this.policy.features) {
            if (this.hasConsented(feature.key)) {
                try {
                    const module = await import(feature.module);
                    if (module.run) await module.run();
                } catch (e) {
                    console.error(`❌ Feature ${feature.key} konnte nicht geladen werden:`, e);
                }
            }
        }
    }
}
