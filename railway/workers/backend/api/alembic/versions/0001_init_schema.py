from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'sites',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('code', sa.String(length=50), nullable=False, unique=True),
        sa.Column('name', sa.String(length=100), nullable=False),
    )

    op.create_table(
        'authors',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=200), index=True),
        sa.Column('url', sa.String(length=500)),
        sa.Column('site_id', sa.Integer(), sa.ForeignKey('sites.id', ondelete='SET NULL')),
    )

    op.create_table(
        'works',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('site_work_id', sa.String(length=100)),
        sa.Column('site_id', sa.Integer(), sa.ForeignKey('sites.id'), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('language', sa.String(length=10), nullable=False),
        sa.Column('rating', sa.String(length=50), nullable=False),
        sa.Column('category', sa.String(length=50)),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('word_count', sa.Integer(), nullable=False),
        sa.Column('likes_count', sa.Integer()),
        sa.Column('comments_count', sa.Integer()),
        sa.Column('published_at', sa.String(length=20)),
        sa.Column('updated_at', sa.String(length=20)),
        sa.Column('original_url', sa.String(length=500)),
        sa.Column('author_id', sa.Integer(), sa.ForeignKey('authors.id')),
    )
    op.create_index('ix_works_site_id', 'works', ['site_id'])
    op.create_index('ix_works_title', 'works', ['title'])
    op.create_index('ix_works_language', 'works', ['language'])
    op.create_index('ix_works_rating', 'works', ['rating'])
    op.create_index('ix_works_status', 'works', ['status'])
    op.create_index('ix_works_word_count', 'works', ['word_count'])
    op.create_index('ix_works_updated_at', 'works', ['updated_at'])

    op.create_table(
        'chapters',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('work_id', sa.Integer(), sa.ForeignKey('works.id', ondelete='CASCADE'), nullable=False),
        sa.Column('chapter_number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=500)),
        sa.Column('content_html', sa.Text(), nullable=False),
    )
    op.create_index('ix_chapters_work_id', 'chapters', ['work_id'])

    op.create_table(
        'work_fandoms',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('work_id', sa.Integer(), sa.ForeignKey('works.id', ondelete='CASCADE'), nullable=False),
        sa.Column('fandom', sa.String(length=200), nullable=False),
    )
    op.create_index('ix_work_fandoms_work_id', 'work_fandoms', ['work_id'])
    op.create_index('ix_work_fandoms_fandom', 'work_fandoms', ['fandom'])

    op.create_table(
        'work_tags',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('work_id', sa.Integer(), sa.ForeignKey('works.id', ondelete='CASCADE'), nullable=False),
        sa.Column('tag', sa.String(length=200), nullable=False),
    )
    op.create_index('ix_work_tags_work_id', 'work_tags', ['work_id'])
    op.create_index('ix_work_tags_tag', 'work_tags', ['tag'])

    op.create_table(
        'work_warnings',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('work_id', sa.Integer(), sa.ForeignKey('works.id', ondelete='CASCADE'), nullable=False),
        sa.Column('warning', sa.String(length=200), nullable=False),
    )
    op.create_index('ix_work_warnings_work_id', 'work_warnings', ['work_id'])
    op.create_index('ix_work_warnings_warning', 'work_warnings', ['warning'])

    # Триграммные индексы предполагают расширение pg_trgm и выражения unaccent/lower на уровне запросов
    # Индексы по title/summary уже есть обычные; специализированные GIN создадим отдельной миграцией при подключении выражений


def downgrade() -> None:
    op.drop_table('work_warnings')
    op.drop_table('work_tags')
    op.drop_table('work_fandoms')
    op.drop_index('ix_chapters_work_id', table_name='chapters')
    op.drop_table('chapters')
    op.drop_index('ix_works_updated_at', table_name='works')
    op.drop_index('ix_works_word_count', table_name='works')
    op.drop_index('ix_works_status', table_name='works')
    op.drop_index('ix_works_rating', table_name='works')
    op.drop_index('ix_works_language', table_name='works')
    op.drop_index('ix_works_title', table_name='works')
    op.drop_index('ix_works_site_id', table_name='works')
    op.drop_table('works')
    op.drop_table('authors')
    op.drop_table('sites')
