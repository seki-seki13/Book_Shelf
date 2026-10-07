CREATE DATABASE IF NOT EXISTS novel_shelf;

USE novel_shelf;


CREATE TABLE books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    author VARCHAR(255) NOT NULL,

    status ENUM(
        'Want to Read',
        'Reading',
        'Finished'
    ) NOT NULL DEFAULT 'Want to Read',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);