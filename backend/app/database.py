from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings

# --- Engine ---
# The engine is the starting point for all SQLAlchemy database operations.
# It manages a pool of database connections that are reused across requests.
# 
# Why a connection pool?
# Opening a new database connection for every request is slow (TCP handshake,
# authentication, etc.). The pool keeps connections open and hands them out
# when needed. This is critical for performance under load.
engine = create_engine(settings.DATABASE_URL)

# --- Session Factory ---
# A session is a "workspace" for database operations. It tracks changes
# you make to objects and sends them to the database when you commit.
#
# sessionmaker creates a factory — calling SessionLocal() gives you a new session.
# autocommit=False: We control when changes are saved (explicit commits).
# autoflush=False: We control when pending changes are sent to the DB.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# --- Base Class ---
# All our ORM models (User, File) will inherit from this class.
# SQLAlchemy uses this to track which classes represent database tables.
class Base(DeclarativeBase):
    pass


# --- Dependency ---
# This function is used by FastAPI's dependency injection system.
# It provides a database session to each request and ensures it's
# properly closed when the request is done (even if an error occurs).
#
# Usage in a route:
#   @app.get("/something")
#   def get_something(db: Session = Depends(get_db)):
#       ...
#
# The 'yield' keyword makes this a generator:
# 1. Before yield: create and provide the session
# 2. After yield: clean up (close the session)
# The 'finally' block ensures cleanup happens even if the route throws an error.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
