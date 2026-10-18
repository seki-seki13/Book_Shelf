const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

function showMessage(elementId, message) {
    const messageElement = document.getElementById(elementId);

    if (messageElement) {
        messageElement.textContent = message;
    }
}

// =================== LOGIN ===================

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        showMessage("login-message", "");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    eUsername: username,
                    ePassword: password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                showMessage(
                    "login-message",
                    result.message || "Could not log in."
                );
                return;
            }

            // The server has set the session cookie.
            // Go back to the bookshelf.
            globalThis.location.href = "index.html";

        } catch (error) {
            console.error("Login error:", error);

            showMessage(
                "login-message",
                "Could not connect to the server. Please try again."
            );
        }
    });
}

// =================== REGISTRATION ===================

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("register-username").value;
        const password = document.getElementById("register-password").value;

        showMessage("register-message", "");

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    eUsername: username,
                    ePassword: password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                showMessage(
                    "register-message",
                    result.message || "Could not create your account."
                );
                return;
            }

            globalThis.location.href = "login.html";

        } catch (error) {
            console.error("Registration error:", error);

            showMessage(
                "register-message",
                "Could not connect to the server. Please try again."
            );
        }
    });
}

// =================== LOGOUT ===================

const logoutButton = document.getElementById("logout-button");

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "same-origin"
            });

            if (!response.ok) {
                alert("Could not log out. Please try again.");
                return;
            }

            globalThis.location.href = "index.html";

        } catch (error) {
            console.error("Logout error:", error);
            alert("Could not connect to the server.");
        }
    });
}
