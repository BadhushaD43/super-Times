from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .database import SQLALCHEMY_DATABASE_URL
from .models import Product, Review

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def seed_data():
    db = SessionLocal()
    try:
        db.query(Review).delete()
        db.query(Product).delete()
        db.commit()
    except Exception as e:
        print("Seed clear error:", e)
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
