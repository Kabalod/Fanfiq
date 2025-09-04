from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_unique_constraint('uq_works_site_sitework', 'works', ['site_id', 'site_work_id'])


def downgrade() -> None:
    op.drop_constraint('uq_works_site_sitework', 'works', type_='unique')
