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

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    cover_path VARCHAR(500) NULL
);


CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    session_id CHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_expiry (expires_at)
);
