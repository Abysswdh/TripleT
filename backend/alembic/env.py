"""
Doable! Backend — Alembic Environment Configuration

Configures Alembic to use the app's SQLAlchemy models and database URL.
"""
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Import app config & models
from app.config import get_settings
from app.db.base import Base
from app.models import (  # noqa: F401 — registers models with Base
    BookmarkedProject,
    ClientProfile,
    Contract,
    ContractMilestone,
    Conversation,
    ConversationParticipant,
    EscrowTransaction,
    FreelancerProfile,
    IdentityVerification,
    Message,
    Milestone,
    Notification,
    PortfolioProject,
    Project,
    ProjectFile,
    ProjectTask,
    Proposal,
    Review,
    SavedTalent,
    TalentInvitation,
    User,
    UserNotificationSettings,
)

# Alembic Config object
config = context.config

# Set sqlalchemy.url from app settings
settings = get_settings()
if settings.DATABASE_URL:
    config.set_main_option(
        "sqlalchemy.url",
        settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    )

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# MetaData for autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations in 'online' mode with async engine."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    import asyncio
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
