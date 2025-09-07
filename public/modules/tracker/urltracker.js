// Liest URL-Parameter aus und gibt sie als Objekt zurück
export function getURLParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};

    for (const [key, value] of params.entries()) {
        result[key] = value;
    }

    return result;
}
