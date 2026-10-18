
import connection from "../connection.js";
import { authorize } from "../middleware/authorize.js";
import { saveCover } from "../utils/covers.js";

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json"
        }
    });
}

export async function handleBookRoutes(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/books") {
        if (request.method === "GET") {
            const [rows] = await connection.query(
                "CALL GetAllBooks()"
            );

            return jsonResponse(rows[0]);
        }

        if (request.method === "POST") {
            // Only admins can add books.
            const access = await authorize("admin")(request);

            if (access.error) {
                return access.error;
            }

            const formData = await request.formData();

            const title = formData.get("newTitle");
            const author = formData.get("newAuthor");
            const status = formData.get("newStatus");
            const coverFile = formData.get("cover-image");

            const allowedStatuses = [
                "Want to Read",
                "Reading",
                "Finished"
            ];

            if (
                typeof title !== "string" ||
                typeof author !== "string" ||
                typeof status !== "string" ||
                !title.trim() ||
                !author.trim() ||
                !allowedStatuses.includes(status)
            ) {
                return jsonResponse({
                    message: "Please provide a valid title, author, and status."
                }, 400);
            }

            let coverPath = null;

            if (coverFile instanceof File && coverFile.size > 0) {
                try {
                    coverPath = await saveCover(coverFile);
                } catch (error) {
                    return jsonResponse({
                        message: error.message
                    }, 400);
                }
            }

            await connection.query(
                "CALL AddBook(?, ?, ?, ?)",
                [
                    title.trim(),
                    author.trim(),
                    status,
                    coverPath
                ]
            );

            return jsonResponse({
                message: "Book added successfully"
            }, 201);
        }

        return null;
    }

    if (url.pathname.startsWith("/api/books/")) {
        const idText = url.pathname.slice("/api/books/".length);

        // Accept only a single numeric book ID in the URL.
        if (!/^\d+$/.test(idText)) {
            return jsonResponse({
                message: "Invalid book ID."
            }, 400);
        }

        const bookId = Number(idText);

        if (!Number.isSafeInteger(bookId) || bookId < 1) {
            return jsonResponse({
                message: "Invalid book ID."
            }, 400);
        }

        if (request.method === "DELETE") {
            const access = await authorize("admin")(request);

            if (access.error) {
                return access.error;
            }

            await connection.query(
                "CALL DeleteBook(?)",
                [bookId]
            );

            return jsonResponse({
                message: "Book deleted successfully"
            });
        }


        if (request.method === "PUT") {
            const access = await authorize("admin")(request);

            if (access.error) {
                return access.error;
            }

            const formData = await request.formData();

            const newTitle = formData.get("newTitle");
            const newAuthor = formData.get("newAuthor");
            const newStatus = formData.get("newStatus");
            const coverFile = formData.get("cover-image");

            const allowedStatuses = [
                "Want to Read",
                "Reading",
                "Finished"
            ];

            if (
                typeof newTitle !== "string" ||
                typeof newAuthor !== "string" ||
                typeof newStatus !== "string" ||
                !newTitle.trim() ||
                !newAuthor.trim() ||
                !allowedStatuses.includes(newStatus)
            ) {
                return jsonResponse({
                    message: "Please provide a valid title, author, and status."
                }, 400);
            }

            // null means no replacement cover was uploaded.
            let coverPath = null;

            if (coverFile instanceof File && coverFile.size > 0) {
                try {
                    coverPath = await saveCover(coverFile);
                } catch (error) {
                    return jsonResponse({
                        message: error.message
                    }, 400);
                }
            }

            await connection.query(
                "CALL UpdateBook(?, ?, ?, ?, ?)",
                [
                    bookId,
                    newTitle.trim(),
                    newAuthor.trim(),
                    newStatus,
                    coverPath
                ]
            );

            return jsonResponse({
                message: "Book updated successfully"
            });
        }

        return null;
    }

    // This module does not handle this URL.
    return null;
}
