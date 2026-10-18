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
````

## Architecture

The application has three main layers:

### Frontend

The frontend is located in `public/`.

* `index.html` provides the page structure.
* `style.css` provides styling.
* `app.js` communicates with the backend using `fetch()`.

The frontend does not connect directly to MySQL.

### Backend

The backend is located in `server/`.

`main.js`:

* receives HTTP requests
* determines the requested route and HTTP method
* receives JSON from the frontend
* calls the appropriate MySQL stored procedure
* returns JSON responses

`connection.js` creates the connection to MySQL using environment variables.

### Database

The SQL files are located in `database/`.

The database contains a `books` table and stored procedures for:

* retrieving all books
* retrieving a book by ID
* adding a book
* updating a book
* deleting a book

## API Endpoints

| Method | Endpoint         | Purpose       |
| ------ | ---------------- | ------------- |
| GET    | `/api/books`     | Get all books |
| GET    | `/api/books/:id` | Get one book  |
| POST   | `/api/books`     | Add a book    |
| PUT    | `/api/books/:id` | Update a book |
| DELETE | `/api/books/:id` | Delete a book |

## Example Request Flow

When the user adds a book:

```text
User fills in form
       ↓
app.js
       ↓
POST /api/books
       ↓
Deno main.js
       ↓
CALL AddBook(...)
       ↓
MySQL
       ↓
Response sent back to browser
       ↓
Frontend reloads the book list
```

When the user edits a book:

```text
User clicks Edit
       ↓
Frontend displays edit form
       ↓
User clicks Save
       ↓
PUT /api/books/:id
       ↓
Deno
       ↓
CALL UpdateBook(...)
       ↓
MySQL
       ↓
Frontend reloads the book list
```

## Running the Project

### 1. Install Deno

Make sure Deno is installed.

### 2. Set up MySQL

Create the database and run the SQL files in the `database/` directory.

### 3. Configure environment variables

Create a `.env` file based on `.env.example`.

Example:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=novel_shelf
```

Do not commit `.env` to GitHub.

### 4. Start the server

```bash
deno task start
```

The server will run on:

```text
http://localhost:8000/
```
