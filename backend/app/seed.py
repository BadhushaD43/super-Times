from sqlalchemy.orm import sessionmaker
from .database import engine
from .models import Product, Review

SessionLocal = sessionmaker(bind=engine)


def seed_data():
    db = SessionLocal()
    try:
        if db.query(Product).count() == 0 and db.query(Review).count() == 0:
            return
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
