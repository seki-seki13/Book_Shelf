
const ARGON2_OPTIONS = {
    name: "Argon2id",
    memory: 65536, // 64 MiB
    passes: 3,
    parallelism: 1
};

const encoder = new TextEncoder();

// Convert bytes into a hexadecimal string for database storage.
function toHex(bytes) {
    return Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

// Convert a hexadecimal string back into bytes.
function fromHex(hex) {
    if (hex.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(hex)) {
        throw new Error("Invalid hexadecimal value.");
    }

    const bytes = new Uint8Array(hex.length / 2);

    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }

    return bytes;
}

// Derive a password hash using the supplied salt.
async function derivePasswordHash(password, salt) {
    const key = await crypto.subtle.importKey(
        "raw-secret",
        encoder.encode(password),
        "Argon2id",
        false,
        ["deriveBits"]
    );

    const hash = await crypto.subtle.deriveBits(
        {
            ...ARGON2_OPTIONS,
            nonce: salt
        },
        key,
        256
    );

    return new Uint8Array(hash);
}

// Create a hash for a new password.
export async function hashPassword(password) {
    // Each password gets its own random 16-byte salt.
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const hash = await derivePasswordHash(password, salt);

    // Store both values. The salt is not a secret.
    return `${toHex(salt)}:${toHex(hash)}`;
}

// Check a password against its stored hash.
export async function verifyPassword(password, storedHash) {
    try {
        const parts = storedHash.split(":");

        if (parts.length !== 2) {
            return false;
        }

        const [saltHex, hashHex] = parts;
        const salt = fromHex(saltHex);
        const expectedHash = fromHex(hashHex);

        if (salt.length !== 16 || expectedHash.length !== 32) {
            return false;
        }

        const actualHash = await derivePasswordHash(password, salt);

        // Compare every byte rather than stopping at the first mismatch.
        let difference = 0;

        for (let i = 0; i < expectedHash.length; i++) {
            difference |= actualHash[i] ^ expectedHash[i];
        }

        return difference === 0;
    } catch {
        return false;
    }
}
