
import { authenticate } from "./authentication.js";

// Checks whether the request has a logged-in user
// whose role is included in the allowed roles.
export function authorize(...allowedRoles) {
    return async function (request) {
        const user = await authenticate(request);

        if (!user) {
            return {
                error: new Response(
                    JSON.stringify({
                        message: "Authentication required."
                    }),
                    {
                        status: 401,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                )
            };
        }

        if (!allowedRoles.includes(user.role)) {
            return {
                error: new Response(
                    JSON.stringify({
                        message: "You do not have permission to perform this action."
                    }),
                    {
                        status: 403,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                )
            };
        }

        return { user };
    };
}
