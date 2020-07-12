create database example default character set utf8mb4;
use example;

CREATE TABLE `users`
(
    `user_id` varchar(50) unsigned NOT NULL,
    `email`   varchar(200) UNIQUE NOT NULL,
    PRIMARY KEY (`user_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 /*!
  COLLATE = utf8mb4_bin */;

CREATE TABLE `comments`
(
    `comment_id` varchar(50) unsigned NOT NULL,
    `user_id`    varchar(50) unsigned NOT NULL,
    `body`   varchar(200) UNIQUE NOT NULL,
    PRIMARY KEY (`comment_id`),
    CONSTRAINT `FK_USERS_COMMENTS` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 /*!
  COLLATE = utf8mb4_bin */;
