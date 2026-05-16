from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from ..database import get_db
from ..models import Product as ProductModel
from ..schemas import Product, ProductCreate, ProductUpdate
from ..auth import verify_token, ADMIN_CREDENTIALS, oauth2_scheme

router = APIRouter()

def get_current_user(token: str = Depends(oauth2_scheme)):
    return verify_token(token)

def get_current_admin(current_user: str = Depends(get_current_user)):
    if current_user.username not in ADMIN_CREDENTIALS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/", response_model=List[Product])
def read_products(skip: int = 0, limit: int = 100, category: str = None, featured: bool = None, db: Session = Depends(get_db)):
    query = db.query(ProductModel)
    if category:
        query = query.filter(ProductModel.category.ilike(f"%{category}%"))
    if featured is not None:
        query = query.filter(ProductModel.is_featured == featured)
    products = query.offset(skip).limit(limit).all()
    return products

@router.get("/{product_id}", response_model=Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(product_create: ProductCreate, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    db_product = ProductModel(**product_create.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/{product_id}", response_model=Product)
def update_product(product_id: int, product_update: ProductUpdate, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    db_product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    update_data = product_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    db_product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return None

@router.get("/stats/")
def product_stats(db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    total = db.query(func.count(ProductModel.id)).scalar()
    avg_rating = db.query(func.avg(ProductModel.rating)).scalar() or 0
    return {"total_products": total, "avg_rating": round(avg_rating, 2)}
