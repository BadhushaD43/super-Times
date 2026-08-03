from sqlalchemy import Boolean, Column, Integer, String, Float, Text, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    title = Column(String)
    category = Column(String)
    subcategory = Column(String)
    model_number = Column(String, nullable=True)
    price = Column(Float)
    description = Column(Text)
    image_key = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    images = Column(JSON)  # list of image URLs (uploaded)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __init__(self, **kwargs):
        kwargs.setdefault("is_featured", False)
        kwargs.setdefault("rating", 0.0)
        kwargs.setdefault("total_reviews", 0)
        if kwargs.get("images") is None:
            kwargs["images"] = []
        super().__init__(**kwargs)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_name = Column(String)
    rating = Column(Float)
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String)
    phone = Column(String)
    email = Column(String)
    address = Column(Text)
    pincode = Column(String)
    state = Column(String)
    district = Column(String)
    products = Column(JSON)  # list of {product_id, qty}
    total_price = Column(Float)
    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __init__(self, **kwargs):
        kwargs.setdefault("status", "pending")
        super().__init__(**kwargs)

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="user")  # admin/user

    def __init__(self, **kwargs):
        kwargs.setdefault("role", "user")
        super().__init__(**kwargs)

