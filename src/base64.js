export function btoa (str) {
    if (window) return window.btoa(str);
    else        return Buffer.from(str).toString('base64');
}

export function atob (b64) {
    if (window) return window.atob(b64);
    else        return Buffer.from(b64, 'base64').toString();
}