GDParser.decodeGDLevel = async (encoded, isOfficial=false) => {
    // Fix URL-safe base64
    encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if needed
    while (encoded.length % 4 !== 0) {
        encoded += "=";
    }

    // Add header for official levels
    if (isOfficial) {
        encoded = "H4sIAAAAAAAAA" + encoded;
    }

    // Base64 decode
    const binary = atob(encoded);
    const bytes = new Uint8Array([...binary].map(c => c.charCodeAt(0)));

    async function tryDecompress(type) {
        try {
            const ds = new DecompressionStream(type);
            const stream = new Blob([bytes]).stream().pipeThrough(ds);
            return await new Response(stream).text();
        } catch {
            return null;
        }
    }

    // Try all possibilities
    return (await tryDecompress("gzip") || await tryDecompress("deflate") || ( () => {
        throw new Error("All decompression methods failed");
    }
    )());
}
GDParser.encodeGDLevel = async (text, isOfficial=false) => {
    // Step 1: UTF-8 encode
    const encoder = new TextEncoder();
    const inputBytes = encoder.encode(text);

    // Step 2: gzip compress (match decoder expectation)
    const cs = new CompressionStream("gzip");
    const compressedStream = new Blob([inputBytes]).stream().pipeThrough(cs);
    const compressedBuffer = await new Response(compressedStream).arrayBuffer();

    let compressedBytes = new Uint8Array(compressedBuffer);

    // Step 3: Convert to binary string
    let binary = "";
    for (let i = 0; i < compressedBytes.length; i++) {
        binary += String.fromCharCode(compressedBytes[i]);
    }

    // Step 4: Base64 encode
    let base64 = btoa(binary);

    // Step 5: URL-safe (match decoder fix)
    base64 = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    // Step 6: Remove header if "official" mode (to match your decoder logic)
    if (isOfficial) {
        // remove gzip header prefix "H4sIAAAAAAAAA"
        if (base64.startsWith("H4sIAAAAAAAAA")) {
            base64 = base64.slice("H4sIAAAAAAAAA".length);
        }
    }

    return base64;
}
;
GDParser.operate = async (data, op) => {
    var a = GDParser.parseLevel(await GDParser.decodeGDLevel(data));
    op(a);
    return await GDParser.encodeGDLevel(GDParser.serializeLevel(a));
}

GDParser.decodeSafeBase64 = encoded => {
    // Fix URL-safe base64
    encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if needed
    while (encoded.length % 4 !== 0) {
        encoded += "=";
    }

    return atob(encoded);
}

GDParser.encodeSafeBase64 = binary => {
    // Base64 encode
    let base64 = btoa(binary);

    // URL-safe
    base64 = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return base64;
}
