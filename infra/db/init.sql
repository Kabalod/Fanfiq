-- Таймзона
SET TIME ZONE 'UTC';

-- Расширения для FTS и унификации текста
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Базовая схема для доменных объектов (минимум)
CREATE SCHEMA IF NOT EXISTS fse;

-- Пример: таблицы добавим миграциями (Alembic). Здесь только схема и расширения.


