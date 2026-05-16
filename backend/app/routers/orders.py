from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Order as OrderModel
from ..schemas import Order, OrderCreate
from ..auth import verify_token, ADMIN_CREDENTIALS, oauth2_scheme

router = APIRouter()

def get_current_user(token: str = Depends(oauth2_scheme)):
    return verify_token(token)

def get_current_admin(current_user: str = Depends(get_current_user)):
    if current_user.username not in ADMIN_CREDENTIALS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.post("/", response_model=Order, status_code=status.HTTP_201_CREATED)
def create_order(order_create: OrderCreate, db: Session = Depends(get_db)):
    db_order = OrderModel(**order_create.dict())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/", response_model=List[Order])
def read_orders(skip: int = 0, limit: int = 100, status: str = None, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    query = db.query(OrderModel)
    if status:
        query = query.filter(OrderModel.status == status)
    orders = query.offset(skip).limit(limit).all()
    return orders

@router.get("/{order_id}", response_model=Order)
def read_order(order_id: int, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{order_id}", response_model=Order)
def update_order(order_id: int, order_update: OrderCreate, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    db_order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    update_data = order_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_order, field, value)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    db_order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(db_order)
    db.commit()
    return None
