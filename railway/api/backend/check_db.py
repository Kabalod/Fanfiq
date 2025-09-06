#!/usr/bin/env python3
"""
Проверка подключения к базе данных и существующих таблиц
"""
import os
from sqlalchemy import text, create_engine

# Настраиваем переменные окружения
os.environ['DATABASE_URL'] = 'postgresql+psycopg://fanfiq:fanfiq@localhost:54390/fanfiq'

try:
    engine = create_engine(os.environ['DATABASE_URL'])
    with engine.connect() as conn:
        # Проверяем версию PostgreSQL
        result = conn.execute(text('SELECT version()'))
        version = result.fetchone()[0]
        print('✅ Database connected successfully!')
        print(f'PostgreSQL version: {version[:80]}...')

        # Проверяем существующие таблицы
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        tables = result.fetchall()
        table_names = [t[0] for t in tables]
        print(f'Existing tables: {table_names}')

        # Проверяем расширения PostgreSQL
        result = conn.execute(text("SELECT name FROM pg_available_extensions WHERE installed_version IS NOT NULL"))
        extensions = result.fetchall()
        ext_names = [e[0] for e in extensions]
        print(f'Installed extensions: {ext_names}')

        # Проверяем, есть ли наши расширения
        required_ext = ['unaccent', 'pg_trgm']
        for ext in required_ext:
            if ext in ext_names:
                print(f'✅ Extension {ext} is installed')
            else:
                print(f'❌ Extension {ext} is NOT installed - installing...')
                try:
                    conn.execute(text(f'CREATE EXTENSION IF NOT EXISTS {ext}'))
                    print(f'✅ Extension {ext} installed successfully')
                except Exception as ext_e:
                    print(f'❌ Failed to install {ext}: {ext_e}')

        # Создаем схему если её нет
        try:
            conn.execute(text('CREATE SCHEMA IF NOT EXISTS fse'))
            print('✅ Schema fse created/verified')
        except Exception as schema_e:
            print(f'❌ Failed to create schema: {schema_e}')

        # Устанавливаем таймзону
        try:
            conn.execute(text("SET TIME ZONE 'UTC'"))
            print('✅ Timezone set to UTC')
        except Exception as tz_e:
            print(f'❌ Failed to set timezone: {tz_e}')

        conn.commit()
        print('✅ Database initialization completed!')

except Exception as e:
    print(f'❌ Database error: {e}')
    import traceback
    traceback.print_exc()
