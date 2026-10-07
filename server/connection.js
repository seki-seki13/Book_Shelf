import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
    host: Deno.env.get("DB_HOST"),
    port: Number(Deno.env.get("DB_PORT")),
    user: Deno.env.get("DB_USER"),
    password: Deno.env.get("DB_PASSWORD"),
    database: Deno.env.get("DB_NAME"),
    // multipleStatements: true
});

console.log("Connected to MySQL");

export default connection;