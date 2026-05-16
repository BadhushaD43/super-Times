from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Contact as ContactModel
from ..schemas import Contact, ContactCreate
from ..auth import verify_token, oauth2_scheme, ADMIN_CREDENTIALS

router = APIRouter()

def get_current_user(token: str = Depends(oauth2_scheme)):
    return verify_token(token)

def get_current_admin(current_user: str = Depends(get_current_user)):
    if current_user.username not in ADMIN_CREDENTIALS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.post("/", response_model=Contact, status_code=status.HTTP_201_CREATED)
def create_contact(contact_create: ContactCreate, db: Session = Depends(get_db)):
    db_contact = ContactModel(**contact_create.dict())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

@router.get("/", response_model=List[Contact])
def read_contacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    contacts = db.query(ContactModel).offset(skip).limit(limit).all()
    return contacts

@router.get("/{contact_id}", response_model=Contact)
def read_contact(contact_id: int, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    contact = db.query(ContactModel).filter(ContactModel.id == contact_id).first()
    if contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: int, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    db_contact = db.query(ContactModel).filter(ContactModel.id == contact_id).first()
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(db_contact)
    db.commit()
    return None
