import connection from "../connection.js";
import { hashPassword, verifyPassword } from "../utils/passwords.js";
import { authenticate, getSessionIdFromRequest } from "../middleware/authentication.js"


export async function register(request) {
    let body;

    try {
        body = await request.json();
    } catch {
        return new Response( 
            JSON.stringify( { message: "[!] Invalid JSON body"} ),
            {status: 400, headers: {"Content-type": "application/json"}}
        );
    }

    const {username, password} = body;

    if (
        typeof username !== "string" ||
        !/^[a-zA-Z0-9_]{3,30}$/.test(username)
    ) {
        return new Response( 
            JSON.stringify( {
                message: `[!] Username must be 3-30 characters long 
                and contain only: letters, numbers and underscores`}),
                {status: 400, headers: {"Content-type": "application/json"}}
        );
    }

    if (
        typeof password !== "string" ||
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[_!@#.])[a-zA-Z0-9_!@#.]{12,128}$/.test(password)
    ) {
        return new Response(
            JSON.stringify({
                message: `[!] Password must be 12-128 characters long and contain: 
                1. Both uppercase and lowercase letters
                2. Numbers
                3. Special characters (_ ! @ # .)`}),
                {status: 400, headers: {"Content-type": "application/json"}}
        );
    }

    const passwordHash = await hashPassword(password);

    try {
        await connection.query(
            "CALL RegisterUser(?, ?)",
            [username, passwordHash]
        );
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return new Response(
                JSON.stringify({
                    message: "[!] This username is already taken"
                }), 
                {status: 409, headers: {"Content-type": "application/json"}}
            );
        }

        console.log("[!] Registration failed: ", error);

        return new Response(
            JSON.stringify(
                {message: "[!] Registration failed"}
            ), {status: 500, headers: {"Content-type": "application/json"}}
        );
    }

    return new Response(
        JSON.stringify({
            message: "Account created successfully."
        }),
        {status: 201, headers: {"Content-type": "application/json"}}
    )
}

export async function createSession(userId) {
    const tokenBytes = crypto.getRandomValues(new Uint8Array(32));

    const sessionToken = Array.from(tokenBytes)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

    const tokenHash = await crypto.subtle.digest(
        "SHA-256", new TextEncoder().encode(sessionToken)
    );

    const sessionId = Array.from(new Uint8Array(tokenHash))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString().slice(0, 19).replace("T", " ");

    await connection.query(
        "CALL CreateSession (?, ?, ?)",
        [sessionId, userId, expiresAt]
    );

    return sessionToken;

}

export async function login(request) {
    let body;

    try {
        body = await request.json();
    } catch {
        return new Response( 
            JSON.stringify( { message: "[!] Invalid JSON body"} ),
            {status: 400, headers: {"Content-type": "application/json"}}
        );
    }

    const {eUsername, ePassword} = body;

    if (!eUsername || !ePassword ||
        typeof eUsername !== "string" ||
        typeof ePassword !== "string"
    ) {
        return new Response(
            JSON.stringify({
                message: "[!] Username and password are required"
            }), {
                status: 400, headers: {"Content-type": "application/json"}
            }
        );
    }

    try {
        const [row] = await connection.query(
            "CALL GetUserByUsername(?)",
            [eUsername]
        );

        const userData = row[0][0];


        if (!userData) {
            return new Response(
                JSON.stringify({
                message: "[!] Invalid username or password"
            }), {status: 401, 
                headers: {"Content-type": "application/json"}}
        );
        }

        const verification = await verifyPassword(
            ePassword, userData.password_hash);

        if (!verification) {
            return new Response(
                JSON.stringify({
                    message: "[!] Invalid username or password"
                }), {
                    status: 401, headers: {"Content-type": "application/json"}
                }
            );
        }

        const sessionToken = await createSession(userData.user_id);

        const secureCookie = Deno.env.get("APP_ENV") ===
                                "production" ? "; Secure" : "";

        return new Response(
            JSON.stringify({
                message: "Logged in successfully",
                user: {
                    username: userData.username,
                    role: userData.role
                }
            }), 
            {
                status: 200,
                headers: {
                    "Content-Type" : "application/json",
                    "Set-Cookie": `session=${sessionToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${secureCookie}`
                }
            }
        );


    } catch (error) {
        console.error("Login failed:", error);

        return new Response(
            JSON.stringify({
                message: "[!] Failed to login"
            }), {
                status: 500, headers: {"Content-type": "application/json"}
            }
        );
    }
}


export async function me(request) {
    const user = await authenticate(request);

    if (!user) {
        return new Response(
            JSON.stringify({ message: "Not logged in." }),
            {
                status: 401,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    return new Response(
        JSON.stringify({
            user: {
                user_id: user.user_id,
                username: user.username,
                role: user.role
            }
        }),
        {
            status: 200,
            headers: { "Content-Type": "application/json" }
        }
    );
}

export async function logout(request) {
    const sessionId = await getSessionIdFromRequest(request);

    if (sessionId) {
        await connection.query(
            "CALL DeleteSession(?)",
            [sessionId]
        );
    }

    const secureCookie =
        Deno.env.get("APP_ENV") === "production" ? "; Secure" : "";

    return new Response(
        JSON.stringify({ message: "Logged out successfully." }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie":
                    `session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureCookie}`
            }
        }
    );
}
