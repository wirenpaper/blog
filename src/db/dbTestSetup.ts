import postgres from "postgres"

const noop = () => { /* no-op */ }
const testSql = postgres({
  host: "localhost",
  port: 5432,
  database: "blogdb",
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  onnotice: () => noop
})
export const createTables = `
      -- users table
      create table if not exists users (
        id int generated always as identity primary key,
        user_name varchar(255) not null unique,
        hashed_password varchar(255) not null,
        first_name text,
        last_name text,
        reset_token text,
        reset_token_expires timestamp
      );
      -- posts table
      create table if not exists posts (
        id int generated always as identity primary key,
        post text not null,
        user_id integer not null,
        foreign key (user_id) references users(id) on delete cascade
      );
      -- comments table
      create table if not exists comments (
        id int generated always as identity primary key,
        comment text not null,
        user_id integer,
        post_id integer,
        foreign key (user_id) references users(id) on delete set null,
        foreign key (post_id) references posts(id) on delete cascade
      )
    `

export const truncateTables = `
      delete from comments;
      delete from posts;
      delete from users;
    `

export const dropTables = `
      drop table if exists comments;
      drop table if exists posts;
      drop table if exists users;
    `

// export type PostgresClient = ReturnType<typeof postgres>

export default testSql
