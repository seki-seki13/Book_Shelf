# Novel Shelf

A small book library web application built as a prototype for the larger Book Shop project.

The purpose of this project is to practice web application architecture using:

**Browser -> Deno Backend -> MySQL Database**

## Technologies

- HTML, CSS, JavaScript
- Deno
- MySQL
- mysql2
- Stored Procedures
- Session-based authentication and role-based authorization

## Project Structure

```text
BookShelf/
├── database/
│   ├── tables.sql
│   ├── initial_data.sql
│   └── stored_procedures/
│       ├── registration.sql
│       └── books.sql
├── server/
│   ├── middleware/
│   │   ├── authorize.js
│   │   └── authentication.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── books.js
│   ├── utils/
│   │   ├── passwords.js
│   │   └── covers.js
│   ├── connection.js
│   └── main.js
├── public/
│   ├── pages/
│   │   ├── index.html
│   │   ├── login.html
│   │   └── register.html
│   ├── styles/
│   │   ├── style.css
│   │   └── auth.css
│   ├── javascript/
│   │   ├── app.js
│   │   ├── auth.js
│   │   └── images.js
│   └── uploads/
├── .env.example
├── .gitignore
├── deno.json
├── deno.lock
└── README.md
```

## Architecture

The application is organized into three main layers:

- **Frontend (`public/`)** — Provides the user interface and communicates with the backend through HTTP requests using `fetch()`.
- **Backend (`server/`)** — Handles API requests, authentication, authorization, book operations, and communication with the database.
  - `routes/` separates authentication and book-related endpoints.
  - `middleware/` handles authentication and access control.
  - `utils/` contains reusable helpers, including password hashing and cover uploads.
- **Database (`database/`)** — Contains SQL table definitions, initial data, and stored procedures for database operations.

Database credentials are configured through environment variables. The `.env` file must not be committed to version control.

## Running the Project

Configure MySQL and create a `.env` file based on `.env.example`. Then start the server:

```bash
deno task start
```

The application is available at [http://localhost:8000/](http://localhost:8000/).
