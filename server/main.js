import {serveDir} from "@std/http/file-server"
import { login, register, me, logout } from "./routes/auth.js";
import { handleBookRoutes } from "./routes/books.js";



Deno.serve(async (request) => { 
    const url = new URL(request.url); 

    if (url.pathname === "/") {
        return Response.redirect(
            new URL("/pages/index.html", request.url),
            302
        );
    }

    if (url.pathname === "/api/auth/register" &&
        request.method === "POST"
    ) {
        return await register(request);
    }

    if (url.pathname === "/api/auth/login" &&
        request.method === "POST"
    ) { 
        return await login(request);
    }

    if (url.pathname === "/api/auth/me" &&
        request.method === "GET"
    ) {
        return await me(request);
    }

    if (
        url.pathname === "/api/auth/logout" &&
        request.method === "POST"
    ) {
        return await logout(request);
    }

    const bookResponse = await handleBookRoutes(request);

    if (bookResponse !== null) {
        return bookResponse;
    }

    
    
    return serveDir(request, {
        fsRoot: "./public"
    }); 
});