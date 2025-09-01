#!/usr/bin/env python3
"""
Применение миграций Alembic через Python API
"""
import os
import sys

# Настраиваем переменные окружения
os.environ['DATABASE_URL'] = 'postgresql+psycopg://fanfiq:fanfiq@localhost:54390/fanfiq'
os.environ['REDIS_URL'] = 'redis://localhost:63790/0'

# Добавляем текущую директорию в путь
sys.path.append('.')

try:
    from alembic.config import Config
    from alembic import command

    # Создаем конфиг с правильным путем
    alembic_cfg = Config('api/alembic.ini')
    alembic_cfg.set_main_option('script_location', 'api/alembic')
    alembic_cfg.set_main_option('sqlalchemy.url', os.environ['DATABASE_URL'])

    print('🚀 Applying database migrations...')
    command.upgrade(alembic_cfg, 'head')
    print('✅ All migrations applied successfully!')

except Exception as e:
    print(f'❌ Migration error: {e}')
    import traceback
    traceback.print_exc()
