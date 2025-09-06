from alembic import op

# revision identifiers, used by Alembic.
revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Устанавливаем расширения
    op.execute('CREATE EXTENSION IF NOT EXISTS unaccent;')
    op.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm;')
    
    # Обёртка IMMUTABLE вокруг unaccent(dict, text)
    op.execute(
        """
        CREATE OR REPLACE FUNCTION public.f_unaccent(text)
        RETURNS text
        LANGUAGE sql
        IMMUTABLE
        AS $$ SELECT public.unaccent('public.unaccent', $1) $$;
        """
    )

    # Индексы GIN по триграммам на нормализованные поля
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_works_title_trgm_expr
        ON works USING GIN ((public.f_unaccent(lower(title))) gin_trgm_ops);
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_works_summary_trgm_expr
        ON works USING GIN ((public.f_unaccent(lower(summary))) gin_trgm_ops);
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_works_summary_trgm_expr;")
    op.execute("DROP INDEX IF EXISTS idx_works_title_trgm_expr;")
    op.execute("DROP FUNCTION IF EXISTS public.f_unaccent(text);")
