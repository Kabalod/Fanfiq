-- Создание таблиц на основе миграции 0001_init_schema
-- Выполнить в PostgreSQL после подключения

-- Таблица сайтов
CREATE TABLE sites (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL
);

-- Таблица авторов
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    url VARCHAR(500),
    site_id INTEGER REFERENCES sites(id) ON DELETE SET NULL
);

-- Таблица работ
CREATE TABLE works (
    id SERIAL PRIMARY KEY,
    site_work_id VARCHAR(100),
    site_id INTEGER NOT NULL REFERENCES sites(id),
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    language VARCHAR(10) NOT NULL,
    rating VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    word_count INTEGER NOT NULL,
    likes_count INTEGER,
    comments_count INTEGER,
    published_at VARCHAR(20),
    updated_at VARCHAR(20),
    original_url VARCHAR(500),
    author_id INTEGER REFERENCES authors(id)
);

-- Таблица глав
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(500),
    content_html TEXT NOT NULL
);

-- Таблица фандомов работ
CREATE TABLE work_fandoms (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    fandom VARCHAR(200) NOT NULL
);

-- Таблица тегов работ
CREATE TABLE work_tags (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    tag VARCHAR(200) NOT NULL
);

-- Таблица предупреждений работ
CREATE TABLE work_warnings (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    warning VARCHAR(200) NOT NULL
);

-- Добавление сайтов
INSERT INTO sites (code, name) VALUES
    ('ficbook', 'Ficbook'),
    ('authortoday', 'Author.Today')
ON CONFLICT (code) DO NOTHING;

-- Создание индексов (после создания всех таблиц)
CREATE INDEX ix_authors_name ON authors (name);
CREATE INDEX ix_works_site_id ON works (site_id);
CREATE INDEX ix_works_title ON works (title);
CREATE INDEX ix_works_language ON works (language);
CREATE INDEX ix_works_rating ON works (rating);
CREATE INDEX ix_works_status ON works (status);
CREATE INDEX ix_works_word_count ON works (word_count);
CREATE INDEX ix_works_updated_at ON works (updated_at);
CREATE INDEX ix_chapters_work_id ON chapters (work_id);
CREATE INDEX ix_work_fandoms_work_id ON work_fandoms (work_id);
CREATE INDEX ix_work_fandoms_fandom ON work_fandoms (fandom);
CREATE INDEX ix_work_tags_work_id ON work_tags (work_id);
CREATE INDEX ix_work_tags_tag ON work_tags (tag);
CREATE INDEX ix_work_warnings_work_id ON work_warnings (work_id);
CREATE INDEX ix_work_warnings_warning ON work_warnings (warning);
