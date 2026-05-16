from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Review as ReviewModel, Product as ProductModel
from ..schemas import Review, ReviewCreate
from ..auth import verify_token, ADMIN_CREDENTIALS, oauth2_scheme

router = APIRouter()

def get_current_user(token: str = Depends(oauth2_scheme)):
    return verify_token(token)

def get_current_admin(current_user: str = Depends(get_current_user)):
    if current_user.username not in ADMIN_CREDENTIALS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.post("/", response_model=Review, status_code=status.HTTP_201_CREATED)
def create_review(review_create: ReviewCreate, db: Session = Depends(get_db)):
    db_review = ReviewModel(**review_create.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    product_reviews = db.query(ReviewModel.rating).filter(ReviewModel.product_id == review_create.product_id).all()
    if product_reviews:
        avg_rating = sum(r[0] for r in product_reviews) / len(product_reviews)
        product = db.query(ProductModel).filter(ProductModel.id == review_create.product_id).first()
        product.rating = avg_rating
        product.total_reviews = len(product_reviews)
        db.commit()
    
    return db_review

@router.get("/", response_model=List[Review])
def read_reviews(product_id: int = Query(..., description="Filter by product"), skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    reviews = db.query(ReviewModel).filter(ReviewModel.product_id == product_id).offset(skip).limit(limit).all()
    return reviews

@router.get("/{review_id}", response_model=Review)
def read_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(ReviewModel).filter(ReviewModel.id == review_id).first()
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    return review

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(review_id: int, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    db_review = db.query(ReviewModel).filter(ReviewModel.id == review_id).first()
    if db_review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(db_review)
    db.commit()
    return None
