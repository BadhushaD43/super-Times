from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
DATABASE_BACKEND = make_url(SQLALCHEMY_DATABASE_URL).get_backend_name()
IS_SQLITE = DATABASE_BACKEND == "sqlite"
DB_SCHEMA = None if IS_SQLITE else os.getenv("DB_SCHEMA", "public")

engine_kwargs = {}
if IS_SQLITE:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["connect_args"] = {"options": f"-csearch_path={DB_SCHEMA}"}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    **engine_kwargs,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
if DB_SCHEMA:
    Base.metadata.schema = DB_SCHEMA

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
