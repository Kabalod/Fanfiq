CREATE TABLE sites (
    id SERIAL PRIMARY KEY,
    code VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL
);

CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    site_id INTEGER NOT NULL REFERENCES sites(id),
    name VARCHAR NOT NULL,
    url VARCHAR
);

CREATE TABLE works (
    id SERIAL PRIMARY KEY,
    site_id INTEGER NOT NULL REFERENCES sites(id),
    author_id INTEGER NOT NULL REFERENCES authors(id),
    title VARCHAR NOT NULL,
    summary TEXT,
    status VARCHAR,
    rating VARCHAR,
    category VARCHAR,
    word_count INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(site_id, title, author_id)
);

CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id),
    chapter_number INTEGER NOT NULL,
    title VARCHAR,
    content_html TEXT
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    work_id INTEGER NOT NULL REFERENCES works(id),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE reading_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    work_id INTEGER NOT NULL REFERENCES works(id),
    chapter_id INTEGER NOT NULL REFERENCES chapters(id),
    progress FLOAT DEFAULT 0.0,
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE pairings (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id),
    character_name VARCHAR NOT NULL
);

CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id),
    name VARCHAR NOT NULL
);
