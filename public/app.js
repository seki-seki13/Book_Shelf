// Importing/connecting to index.html
const booksContainer = document.getElementById("books-container");
const bookForm = document.getElementById("book-form");

async function loadBooks() {
    try {
        const response = await fetch("/api/books");

        const books = await response.json();

        // console.log(books);

        booksContainer.innerHTML = "";

        books.forEach(book => {
            const bookElement = document.createElement("div");

            bookElement.classList.add("book");

            bookElement.innerHTML = `
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Status:</strong> ${book.status}</p>
                <button class="edit-button" type="button"
                        data-book-id="${book.book_id}">Edit</button>
                <button class="delete-button" type="button"
                        data-book-id="${book.book_id}">Delete</button>
            `;
            // =================== EDIT BUTTON ===================
            const editButton = bookElement.querySelector(".edit-button");

            editButton.addEventListener("click", () => {


                try {
                    bookElement.innerHTML = `
                        <form id="book-change-form">
                            <label for="new-title">Title</label>
                            <input 
                                type="text" 
                                id="new-title" 
                                value="${book.title}" 
                                required>

                            <label for="new-author">Author</label>
                            <input
                                type="text"
                                id="new-author"
                                value="${book.author}"
                                required>    

                            <label for="new-status">Status</label>
                            <select id="new-status" name="status">
                                <option value="Want to Read">Want to Read</option>
                                <option value="Reading">Reading</option>
                                <option value="Finished">Finished</option>
                            </select>

                            <button class="save-changes-button" type="submit">
                                    Save changes</button>
                            <button class="cancel-button" type="button">
                                    Cancel</button>
                        </form>`;

                    // =================== SAVE CHANGES BUTTON ===================    

                    const changeForm = bookElement.querySelector("#book-change-form");
                    

                    changeForm.addEventListener("submit", async (event) => {
                        console.log("we clicked the save changes button");
                        event.preventDefault();

                        const newTitle = document.getElementById("new-title").value;
                        const newAuthor = document.getElementById("new-author").value;
                        const newStatus = document.getElementById("new-status").value;

                        const bookID = book.book_id;
                        console.log("we got data in save changes button");
                        const response = await fetch(`/api/books/${bookID}`, {
                            method: "PUT",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                newTitle,
                                newAuthor,
                                newStatus
                            }) 
                        } );
                        console.log("we did the response-fetch in save button");
                        if (response.ok) {
                            loadBooks();
                        }

                    });

                    // =================== CANCEL  BUTTON =================== 

                    const cancelButton = bookElement.querySelector(".cancel-button");

                    cancelButton.addEventListener("click", () => {
                        loadBooks();
                    })

                        
                } catch (error) {
                    bookElement.innerHTML =
                            "<p>Could not edit a book.</p>";

                        console.error(error);
                }
            });
            
            


            // =================== DELETE BUTTON ===================
            const deleteButton = bookElement.querySelector(".delete-button");

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
            });

                

            booksContainer.appendChild(bookElement);
        });

    } catch (error) {
        booksContainer.innerHTML =
            "<p>Could not load books.</p>";

        console.error(error);

        loadBooks();
    } 
}


bookForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const status = document.getElementById("status").value;

    const response = await fetch("/api/books", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title: title,
            author: author,
            status: status
        })
    });

    if (response.ok) {
        bookForm.reset();
        loadBooks();
    }
});


loadBooks();