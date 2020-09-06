create database example default character set utf8mb4;
use example;

create table `users`
(
    `user_id` bigint unsigned NOT NULL,
    `email` varchar(300) NOT NULL,
    primary key (`user_id`)
)  engine =InnoDB default charset=utf8mb4;

create table `comments`
(
    `comment_id` bigint unsigned not null,
    `user_id` bigint unsigned not null,
    `text` varchar(300) not null,
    primary key (`comment_id`),
    constraint `FK_COMMENTS_USER_ID_USERS_USER_ID` foreign key (`user_id`) references `users` (`user_id`)
)
