drop table if exists comments;
drop table if exists posts;
drop table if exists users;

-- users table
create table if not exists users (
    id int generated always as identity primary key,
    user_name varchar(255) not null unique,
    hashed_password varchar(255) not null,
    first_name text,
    last_name text,
    reset_token text,
    reset_token_expires timestamp,
    token_verified BOOLEAN DEFAULT false
);

-- posts table
create table if not exists posts (
    id int generated always as identity primary key,
    post text not null,
    user_id integer not null,
    foreign key (user_id) references users(id)
);

-- comments table
create table if not exists comments (
    id int generated always as identity primary key,
    comment text not null,
    user_id integer,
    post_id integer,
    foreign key (user_id) references users(id),
    foreign key (post_id) references posts(id) on delete cascade
);
