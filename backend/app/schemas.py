from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Dict
from datetime import datetime


class ProductBase(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    name: str
    title: str
    category: str
    subcategory: Optional[str] = None
    model_number: Optional[str] = None
    price: float
    description: str
    image_key: Optional[str] = None
    images: List[str] = Field(default_factory=list)
    is_featured: bool = False


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    name: Optional[str] = None
    title: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    model_number: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    image_key: Optional[str] = None
    images: Optional[List[str]] = None
    is_featured: Optional[bool] = None


class Product(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    rating: float
    total_reviews: int
    created_at: datetime


class ReviewBase(BaseModel):
    product_id: int
    user_name: str
    rating: float
    comment: str


class ReviewCreate(ReviewBase):
    pass


class Review(ReviewBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class OrderBase(BaseModel):
    customer_name: str
    phone: str
    email: str
    address: str
    pincode: str
    state: str
    district: str
    products: List[Dict[str, int]]
    total_price: float


class OrderCreate(OrderBase):
    pass


class Order(OrderBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: str
    created_at: datetime


class ContactBase(BaseModel):
    name: str
    email: str
    phone: str
    message: str


class ContactCreate(ContactBase):
    pass


class Contact(ContactBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class OTPRequest(BaseModel):
    username: str
    password: str


class OTPVerify(BaseModel):
    username: str
    otp: str
