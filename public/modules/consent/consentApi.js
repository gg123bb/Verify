// modules/consent/consentApi.js
let _manager = null;

/** Setzt die ConsentManager-Instanz (muss von index.js aufgerufen werden) */
export function setManager(managerInstance) {
    _manager = managerInstance;
}

/** Gibt die Manager-Instanz zurück (oder null) */
export function getManager() {
    return _manager;
}

/** Wrapper: Status (sicher) */
export async function getStatus() {
    if (!_manager) return { ready: false, message: 'no-manager' };
    if (typeof _manager.getStatus === 'function') return _manager.getStatus();
    // fallback: build status
    return {
        ready: true,
        policyVersion: _manager.policy?.policyVersion || null,
        region: _manager.policy?.region || null,
        consents: _manager.consents || {},
        features: (_manager.policy?.features || []).map(f => ({
            ...f,
            consent: _manager.consents[f.key] ?? f.default ?? false
        }))
    };
}

/** Wrapper: quick form tileset (if manager implements it) */
export function getQuickFormTileset() {
    if (!_manager) throw new Error('no-manager');
    if (typeof _manager.getQuickFormTileset === 'function') return _manager.getQuickFormTileset();
    // fallback: small generic tileset
    return {
        modules: [{
            meta: { id: 'consent-quick' },
            content: [{
                type: 'div',
                attributes: { class: 'consent-quick' },
                children: [
                    { type: 'p', text: 'Bitte Zustimmung erteilen.' },
                    { type: 'button', attributes: { id: 'consent-accept' }, text: 'Akzeptieren' },
                    { type: 'button', attributes: { id: 'consent-more' }, text: 'Mehr anzeigen' }
                ]
            }]
        }]
    };
}

/** Wrapper: extended form tileset */
export function getExtendedFormTileset() {
    if (!_manager) throw new Error('no-manager');
    if (typeof _manager.getExtendedFormTileset === 'function') return _manager.getExtendedFormTileset();
    // fallback: empty
    return { modules: [] };
}

/** Save selection (partial object {key:true,...}) */
export function saveSelection(selection = {}) {
    if (!_manager) throw new Error('no-manager');
    if (typeof _manager.saveSelection === 'function') {
        return _manager.saveSelection(selection);
    }
    // fallback: merge & persist
    _manager.consents = { ...( _manager.consents || {} ), ...selection };
    if (typeof _manager.saveConsents === 'function') {
        _manager.saveConsents();
    } else {
        try { localStorage.setItem('userConsent', JSON.stringify(_manager.consents)); } catch {}
    }
    return Promise.resolve();
}

/** Run features that have consent */
export async function runEnabledFeatures() {
    if (!_manager) throw new Error('no-manager');
    if (typeof _manager.runEnabledFeatures === 'function') {
        return _manager.runEnabledFeatures();
    }
    return Promise.resolve();
}
