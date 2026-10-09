const Database = require("better-sqlite3");
const { CATEGORIES } = require("./constants");

const db = new Database("blog_database.db");
db.pragma("foreign_keys = ON");

// Users Table
db.prepare(
  `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    `,
).run();

// Categories Table
db.prepare(`
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

// Posts Table
db.prepare(
  `
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author_name TEXT NOT NULL,
            image TEXT,
            category_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

            FOREIGN KEY (category_id)
            REFERENCES categories(id)
            ON DELETE RESTRICT
        )
    `,
).run();

// Insert Default Categories
const insertCategories = db.prepare(
    `
        INSERT OR IGNORE INTO categories (name)
        VALUES(?)
    `
);

for (const category of Object.values(CATEGORIES)) {
    insertCategories.run(category);
}

module.exports = db;
