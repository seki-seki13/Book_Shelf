import connection from "./connection.js";
import {serveDir} from "@std/http/file-server"

Deno.serve(async (request) => { 
    const url = new URL(request.url); 

    if (url.pathname === '/api/books') { 
        if (request.method === "GET") {
        const [rows] = await connection.query(
            "CALL GetAllBooks()"
        );

        const books = rows[0];

        return new Response(
            JSON.stringify(books),
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ); }

        if (request.method === "POST") {
            const newBook = await request.json();
            
            await connection.query(
                "CALL AddBook(?, ?, ?)",
                [newBook.title, newBook.author, newBook.status]
            );

            return new Response(
                JSON.stringify({message: "Book added successfully"}),
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
    } }

    if (url.pathname.startsWith("/api/books/")) {
        const book_id = Number(url.pathname.split("/")[3]);

        if (request.method === "DELETE") {

            await connection.query(
                "CALL DeleteBook(?)",
                [book_id]
            );

            return new Response(
                JSON.stringify({message: "Book deleted successfully"}),
                {headers:
                    {"Content-Type": "application/json"}
                }
            );
        }

        if (request.method === "PUT") {
            console.log("we reached main.js put method");
            const updatedBook = await request.json();
            console.log("we got the updated book in main.js put method");
            await connection.query(
                "CALL UpdateBook(?, ?, ?, ?)",
                [book_id, updatedBook.newTitle, 
                    updatedBook.newAuthor, updatedBook.newStatus]
            );

            return new Response(
                JSON.stringify({message: "Book changed successfully"}),
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }
    } 
    
    return serveDir(request, {
        fsRoot: "./public"
    }); 
});












// try {
//     const [rows] = await connection.query(
//         "CALL GetAllBooks()"
//     );
//     console.log(rows[0]);

// } catch (error) {
//     console.log(`Database error: ${error}`);
// } finally {
//     await connection.end();
// }