USE sandbox_db;

INSERT INTO Posts (id, body, groupLimit, authorEmail, createdAt, UpdatedAt) VALUES (1, 'Putting together a pick up basketball game sometime next week - anybody in?', 5, 'username1@somedomain.com', '2015-10-10 10:30:00', '2015-10-10 10:30:00');
INSERT INTO Posts (id, body, groupLimit, authorEmail, createdAt, UpdatedAt) VALUES (2, 'Seeking 4 Volunteers to Pick up Trash in Central Park on March 24th', 5, 'username2@somedomain.com', '2015-10-10 10:30:00', '2015-10-10 10:30:00');
INSERT INTO Posts (id, body, groupLimit, authorEmail, createdAt, UpdatedAt) VALUES (3, 'Anybody want to go grab Shake Shack Burgers on Thursday?', 3, 'username3@somedomain.com', '2015-10-10 10:30:00', '2015-10-10 10:30:00');
INSERT INTO Posts (id, body, groupLimit, authorEmail, createdAt, UpdatedAt) VALUES (4, 'Who wants to throw in for team tacos?', 5, 'username4@somedomain.com', '2015-10-10 10:30:00', '2015-10-10 10:30:00' );

INSERT INTO Users (user_name) VALUES ('User Two');
INSERT INTO Users (user_name) VALUES ('User One');

create database sandbox_db;