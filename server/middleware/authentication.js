
import connection from "../connection.js";

// Extract the session cookie and convert its token into the
// session ID format stored in MySQL.
export async function getSessionIdFromRequest(request) {
    const cookieHeader = request.headers.get("Cookie");

    if (!cookieHeader) {
        return null;
    }

    const sessionCookie = cookieHeader
        .split(";")
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith("session="));

    if (!sessionCookie) {
        return null;
    }

    const sessionToken = sessionCookie.slice("session=".length);

    if (!/^[0-9a-f]{64}$/i.test(sessionToken)) {
        return null;
    }

    const tokenHash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(sessionToken)
    );

    return Array.from(new Uint8Array(tokenHash))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

// Return the logged-in user's public information,
// or null if the request has no valid session.
export async function authenticate(request) {
    const sessionId = await getSessionIdFromRequest(request);

    if (!sessionId) {
        return null;
    }

    const [result] = await connection.query(
        "CALL GetSessionUser(?)",
        [sessionId]
    );

    // The first row of the first result set is the user.
    return result[0][0] ?? null;
}
