from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from .auth import verify_token, create_access_token, ADMIN_CREDENTIALS, oauth2_scheme
from .routers import products, orders, reviews, contacts, admin
from .schemas import Token
from .seed import seed_data
import os

# Create tables
Base.metadata.create_all(bind=engine)

def ensure_schema_updates():
    inspector = inspect(engine)
    if "products" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("products")}
    if "is_featured" not in columns:
        default = "0" if engine.dialect.name == "sqlite" else "FALSE"
        with engine.begin() as conn:
            conn.execute(text(f"ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT {default} NOT NULL"))

ensure_schema_updates()
seed_data()

app = FastAPI(title="E-Commerce API")


def get_allowed_origins():
    raw_origins = os.getenv("ALLOWED_ORIGINS", "")
    if raw_origins:
        return [origin.strip().rstrip("/") for origin in raw_origins.split(",") if origin.strip()]
    return ["http://localhost:5173", "http://127.0.0.1:5173"]


def get_allowed_origin_regex():
    return os.getenv(
        "ALLOWED_ORIGIN_REGEX",
        r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
    )


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_origin_regex=get_allowed_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve product images and gallery statically
PRODUCT_IMG_DIR = os.path.join(os.path.dirname(__file__), "..", "product_images")
GALLERY_DIR = os.path.join(os.path.dirname(__file__), "..", "gallery")
os.makedirs(PRODUCT_IMG_DIR, exist_ok=True)
os.makedirs(GALLERY_DIR, exist_ok=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/admin/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username not in ADMIN_CREDENTIALS or form_data.password != ADMIN_CREDENTIALS[form_data.username]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
app.include_router(contacts.router, prefix="/contacts", tags=["contacts"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

# Mount static file directories (must be after routers)
app.mount("/admin/product-images", StaticFiles(directory=PRODUCT_IMG_DIR), name="product_images")
app.mount("/admin/gallery", StaticFiles(directory=GALLERY_DIR), name="gallery")
