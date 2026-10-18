// Get references to HTML elements from the DOM.
// These elements are defined in index.html and will be manipulated by JavaScript.

const booksContainer = document.getElementById("books-container");
const bookForm = document.getElementById("book-form");

import clearCoverPreview from "./images.js";


let currentUser = null;

const loginLink = document.getElementById("login-link");
const registerLink = document.getElementById("register-link");
const accountGreeting = document.getElementById("account-greeting");
const logoutButton = document.getElementById("logout-button");
const bookFormSection = document.getElementById("book-form-section");

// Ask the backend whether this browser has a valid session.
async function checkCurrentUser() {
    try {
        const response = await fetch("/api/auth/me");

        if (response.ok) {
            const result = await response.json();
            currentUser = result.user ?? result;
        } else {
            currentUser = null;
        }
    } catch (error) {
        console.error("Could not check login status:", error);
        currentUser = null;
    }

    updateAccountNavigation();
    updateAdminControls();
}

function updateAccountNavigation() {
    const isLoggedIn = currentUser !== null;

    loginLink.hidden = isLoggedIn;
    registerLink.hidden = isLoggedIn;
    logoutButton.hidden = !isLoggedIn;
    accountGreeting.hidden = !isLoggedIn;

    if (isLoggedIn) {
        accountGreeting.textContent = `Hello, ${currentUser.username}`;
    }
}

function updateAdminControls() {
    const isAdmin = currentUser?.role === "admin";

    if (bookFormSection) {
        bookFormSection.hidden = !isAdmin;
    }
}


// =================== LOAD BOOKS ===================

async function loadBooks() {
    try {
        /* 
            Requests all books from the Deno backend.

            1. The browser sends:
                GET /api/books

            2. Deno receives the request in main.js and calls:
                CALL GetAllBooks()

            3. The database result is then returned to the browser as JSON.
        */
        const response = await fetch("/api/books");


         /*
            response.json() reads the JSON response sent by the backend
            and converts it into a JavaScript value.

            For this API, "books" will be an array of book objects.
        */
        const books = await response.json();


        booksContainer.innerHTML = ""; // Clear the current list before displaying the latest data.

        if (books.length === 0) {
            booksContainer.textContent = "No books yet. Add your first book!";
            return;
        }

        books.forEach(book => {
            /*
            forEach() goes through every book returned by the backend.

            Each book is used to create a new HTML element which is then
            added to the page.
            */
            const bookElement = document.createElement("div"); // 1. Create a <div> element


            bookElement.classList.add("book");

            const adminButtons = currentUser?.role === "admin"
                ? `
                    <button class="edit-button" type="button"
                            data-book-id="${book.book_id}">Edit</button>

                    <button class="delete-button" type="button"
                            data-book-id="${book.book_id}">Delete</button>
                `
                : "";

            

            /*
                2. Insert the book's data into the HTML.

                book.book_id comes from the MySQL database.
                It is used as the unique identifier when editing or deleting
                this particular book.
            */
            bookElement.innerHTML = `
                <div class = "book-details">
                    <h3>${book.title}</h3>
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p><strong>Status:</strong> ${book.status}</p>
                    ${adminButtons}
                </div>
            `;

            // Only create an image if this book has a saved cover path.
            if (book.cover_path) {
                const coverImage = document.createElement("img");
                coverImage.src = book.cover_path;
                coverImage.alt = `Cover of ${book.title}`;
                coverImage.classList.add("book-cover");
                bookElement.prepend(coverImage);
            }

            // =================== EDIT BUTTON ===================
            // 1. Find the Edit button we just created.
            const editButton = bookElement.querySelector(".edit-button");

            if (editButton) {
                editButton.addEventListener("click", () => {


                try {
                    /*
                        Replace the normal book display with an edit form.

                        At this point we are only changing the frontend.
                        The database has NOT been changed yet.

                        The database will only be updated when the user
                        submits this form.
                    */
                    bookElement.innerHTML = `
                        <form id="book-change-form">
                            <label for="new-title">Title</label>
                            <input 
                                type="text" 
                                id="new-title" 
                                name="newTitle"
                                value="${book.title}" 
                                required>

                            <label for="new-author">Author</label>
                            <input
                                type="text"
                                id="new-author"
                                name="newAuthor"
                                value="${book.author}"
                                required>    

                            <label for="new-status">Status</label>
                            <select id="new-status" name="newStatus">
                                <option value="Want to Read">Want to Read</option>
                                <option value="Reading">Reading</option>
                                <option value="Finished">Finished</option>
                            </select>

                            <label for="edit-cover-image">Change cover (optional)</label>
                            <input
                                type="file"
                                id="edit-cover-image"
                                name="cover-image"
                                accept="image/jpeg,image/png,image/webp,image/gif">

                            <div class="edit-cover-preview">
                                <p>Cover preview:</p>
                                <img
                                    id="edit-cover-preview"
                                    class="book-cover"
                                    alt="Book cover preview"
                                    hidden>
                            </div>

                            <button class="save-changes-button" type="submit">
                                    Save changes</button>
                            <button class="cancel-button" type="button">
                                    Cancel</button>
                        </form>`;

                    // =================== SAVE CHANGES BUTTON ===================    
                    /*
                        The submit event belongs to the FORM ("#book-change-form"), 
                        not the button (".save-changes-button").

                        The Save button has type="submit", so clicking it
                        causes this form's submit event to occur.
                    */
                    const changeForm = bookElement.querySelector("#book-change-form");

                    changeForm.querySelector("#new-status").value = book.status;

                    const editCoverPreview =
                        changeForm.querySelector("#edit-cover-preview");

                    if (book.cover_path) {
                        editCoverPreview.src = book.cover_path;
                        editCoverPreview.hidden = false;
                    }

                    let editPreviewUrl = null;

                    const editCoverInput =
                        changeForm.querySelector("#edit-cover-image");

                    editCoverInput.addEventListener("change", () => {
                        // Release the previous temporary preview URL, if one exists.
                        if (editPreviewUrl) {
                            URL.revokeObjectURL(editPreviewUrl);
                            editPreviewUrl = null;
                        }

                        const file = editCoverInput.files[0];

                        // If the selection was cleared, show the saved cover again.
                        if (!file) {
                            if (book.cover_path) {
                                editCoverPreview.src = book.cover_path;
                                editCoverPreview.hidden = false;
                            } else {
                                editCoverPreview.removeAttribute("src");
                                editCoverPreview.hidden = true;
                            }

                            return;
                        }

                        // Preview the newly selected file locally.
                        editPreviewUrl = URL.createObjectURL(file);
                        editCoverPreview.src = editPreviewUrl;
                        editCoverPreview.hidden = false;
                    });
                    

                    changeForm.addEventListener("submit", async (event) => {
                        event.preventDefault();

                        try {
                            // Collect title, author, status, and the optional image file.
                            const updatedBook = new FormData(changeForm);

                            const bookID = book.book_id;

                            const response = await fetch(`/api/books/${bookID}`, {
                                method: "PUT",
                                body: updatedBook
                            });

                            const result = await response.json();

                            if (!response.ok) {
                                alert(result.message || "Could not update the book.");
                                return;
                            }

                            // Release the temporary preview URL after a successful update.
                            if (editPreviewUrl) {
                                URL.revokeObjectURL(editPreviewUrl);
                                editPreviewUrl = null;
                            }

                            await loadBooks();
                        } catch (error) {
                            console.error(error);
                            alert("Could not update the book.");
                        }
                    });



                    // =================== CANCEL  BUTTON =================== 

                    const cancelButton = bookElement.querySelector(".cancel-button");

                    /*
                        If the backend reports success, reload the books.

                        This gets the latest data from MySQL instead of
                        manually changing the displayed book.
                    */
                    cancelButton.addEventListener("click", () => {
                        if (editPreviewUrl) {
                            URL.revokeObjectURL(editPreviewUrl);
                            editPreviewUrl = null;
                        }
                        loadBooks();
                    })

                        
                } catch (error) {
                    bookElement.innerHTML =
                            "<p>Could not edit a book.</p>";

                        console.error(error);
                }
            });

            }


            // =================== DELETE BUTTON ===================
            const deleteButton = bookElement.querySelector(".delete-button");

            if (deleteButton) {

            deleteButton.addEventListener("click", async () => {
                try {
                    const bookID = deleteButton.dataset.bookId;

                    const response = await fetch(`/api/books/${bookID}`, {
                        method: "DELETE"
                    });

                    if (response.ok) {
                        loadBooks();
                    }

                }   catch (error) {
                        bookElement.innerHTML =
                            "<p>Could not delete a book.</p>";

                        console.error(error);
                }
            });}

                

            booksContainer.appendChild(bookElement);
        });

    } catch (error) {
        booksContainer.innerHTML =
            "<p>Could not load books. Please refresh the page to try again.</p>";

        console.error("Failed to load books: ", error);
    } 
}


bookForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    try {

        const newBook = new FormData(bookForm);

        /*
            This is still the original JSON request.

            The selected cover file is NOT sent yet.
            We will change this when we implement the upload endpoint.
        */
        const response = await fetch("/api/books", {
            method: "POST",
            body: newBook
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "[!] Failed to add the book");
            return;
        }

        // Clear the text inputs and selected cover after success.
        bookForm.reset();
        clearCoverPreview();

        // Refresh the displayed book list.
        await loadBooks();

    } catch (error) {
        console.error(error);
        alert("Could not add the book.");
    }
});

// INITIAL PAGE LOAD
async function initialisePage() {
    await checkCurrentUser();
    await loadBooks();
}

initialisePage();