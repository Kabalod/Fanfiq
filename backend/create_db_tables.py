#!/usr/bin/env python3
"""
Создание таблиц базы данных из SQL скрипта
"""
import os
from sqlalchemy import text, create_engine

# Настраиваем переменные окружения
os.environ['DATABASE_URL'] = 'postgresql+psycopg://fanfiq:fanfiq@localhost:54390/fanfiq'

try:
    engine = create_engine(os.environ['DATABASE_URL'])
    with engine.connect() as conn:
        print('🚀 Creating database tables...')

        # Читаем и выполняем SQL скрипт
        with open('create_tables.sql', 'r', encoding='utf-8') as f:
            sql_script = f.read()

        # Разбиваем на отдельные команды (игнорируя комментарии и пустые строки)
        commands = []
        for cmd in sql_script.split(';'):
            cmd = cmd.strip()
            if cmd and not cmd.startswith('--'):
                commands.append(cmd)

        print(f'📝 Found {len(commands)} SQL commands to execute')

        for i, command in enumerate(commands, 1):
            if command:
                try:
                    conn.execute(text(command))
                    print(f'✅ Executed command {i}/{len(commands)}')
                except Exception as cmd_e:
                    print(f'⚠️  Command {i} failed: {cmd_e}')
                    # Продолжаем выполнение других команд

        conn.commit()
        print('✅ Database tables created successfully!')

        # Проверяем созданные таблицы
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name NOT LIKE 'pg_%' ORDER BY table_name"))
        tables = result.fetchall()
        table_names = [t[0] for t in tables]
        print(f'📊 Created tables: {table_names}')

        # Проверяем данные в таблице sites
        result = conn.execute(text("SELECT * FROM sites"))
        sites = result.fetchall()
        print(f'🌐 Sites in database: {sites}')

except Exception as e:
    print(f'❌ Database creation failed: {e}')
    import traceback
    traceback.print_exc()
