DELIMITER //

CREATE PROCEDURE GetAllBooks()
BEGIN

    SELECT
        book_id,
        title,
        author,
        status,
        created_at
    FROM books
    ORDER BY title;

END //

CREATE PROCEDURE GetBookById(
    IN p_book_id INT
)
BEGIN

    SELECT
        book_id,
        title,
        author,
        status,
        created_at
    FROM books
    WHERE book_id = p_book_id;

END //

CREATE PROCEDURE AddBook(
    IN p_title VARCHAR(255),
    IN p_author VARCHAR(255),
    IN p_status VARCHAR(20)
)
BEGIN

    INSERT INTO books (
        title,
        author,
        status
    )
    VALUES (
        p_title,
        p_author,
        p_status
    );

    SELECT
        book_id,
        title,
        author,
        status,
        created_at
    FROM books
    WHERE book_id = LAST_INSERT_ID();

END //

CREATE PROCEDURE UpdateBook(
    IN p_book_id INT,
    IN p_title VARCHAR(255),
    IN p_author VARCHAR(255),
    IN p_status VARCHAR(20)
)
BEGIN

    UPDATE books
    SET
        title = p_title,
        author = p_author,
        status = p_status
    WHERE book_id = p_book_id;

    SELECT
        book_id,
        title,
        author,
        status,
        created_at
    FROM books
    WHERE book_id = p_book_id;

END //

CREATE PROCEDURE DeleteBook(
    IN p_book_id INT
)
BEGIN

    DELETE FROM books
    WHERE book_id = p_book_id;

END //

DELIMITER ;