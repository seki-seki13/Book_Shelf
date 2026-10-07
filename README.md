# Novel Shelf

A small book library web application built as a prototype for the larger
Book Shop project.

The purpose of this project is to practice the basic architecture that will
be used in the larger team project:

Browser → Deno Backend → MySQL Database

## Technologies

- HTML
- CSS
- JavaScript
- Deno
- MySQL
- mysql2
- Stored Procedures

## Project Structure

```text
novel-shelf/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── server/
│   ├── main.js
│   └── connection.js
│
├── database/
│   ├── tables.sql
│   ├── initial_data.sql
│   └── stored_procedures.sql
│
├── .env.example
├── .gitignore
├── deno.json
├── deno.lock
└── README.md
