
DELIMITER //

CREATE PROCEDURE RegisterUser(
    IN p_username VARCHAR(30),
    IN p_password_hash VARCHAR(255)
)
BEGIN
    INSERT INTO users (username, password_hash)
    VALUES (p_username, p_password_hash);
END//


CREATE PROCEDURE GetUserByUsername(
    IN p_username VARCHAR(30)
)
BEGIN
    SELECT user_id, username, password_hash, role
    FROM users
    WHERE username = p_username
    LIMIT 1;
END//


CREATE PROCEDURE CreateSession(
    IN p_session_id CHAR(64),
    IN p_user_id INT,
    IN p_expires_at DATETIME
)
BEGIN
    INSERT INTO sessions (session_id, user_id, expires_at)
    VALUES (p_session_id, p_user_id, p_expires_at);
END//


CREATE PROCEDURE GetSessionUser(
    IN p_session_id CHAR(64)
)
BEGIN
    SELECT
        u.user_id,
        u.username,
        u.role
    FROM sessions AS s
    JOIN users AS u ON s.user_id = u.user_id
    WHERE s.session_id = p_session_id
      AND s.expires_at > UTC_TIMESTAMP()
    LIMIT 1;
END//


CREATE PROCEDURE DeleteSession(
    IN p_session_id CHAR(64)
)
BEGIN
    DELETE FROM sessions
    WHERE session_id = p_session_id;
END//


CREATE PROCEDURE DeleteExpiredSessions()
BEGIN
    DELETE FROM sessions
    WHERE expires_at <= UTC_TIMESTAMP();
END//

DELIMITER ;
