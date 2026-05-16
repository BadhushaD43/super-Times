from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from ..database import get_db
from ..models import Product, Order, Review, Contact, User
from pydantic import BaseModel
from ..auth import verify_token, oauth2_scheme, ADMIN_CREDENTIALS
import os, shutil, uuid, smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")

router = APIRouter()

GALLERY_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "gallery")
PRODUCT_IMG_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "product_images")
os.makedirs(GALLERY_DIR, exist_ok=True)
os.makedirs(PRODUCT_IMG_DIR, exist_ok=True)

def get_current_admin(token: str = Depends(oauth2_scheme)):
    user = verify_token(token)
    if user.username not in ADMIN_CREDENTIALS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@router.get("/stats/")
def get_stats(db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    total_products = db.query(func.count(Product.id)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    total_revenue = db.query(func.sum(Order.total_price)).scalar() or 0
    avg_order_value = total_revenue / total_orders if total_orders else 0
    new_orders_today = db.query(func.count(Order.id)).filter(
        func.date(Order.created_at) == date.today()
    ).scalar()
    total_reviews = db.query(func.count(Review.id)).scalar()
    total_contacts = db.query(func.count(Contact.id)).scalar()
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "avg_order_value": round(avg_order_value, 2),
        "new_orders_today": new_orders_today,
        "total_reviews": total_reviews,
        "total_contacts": total_contacts
    }

@router.get("/invoice/{order_id}")
def get_invoice(order_id: int, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    products_info = []
    for item in order.products:
        product = db.query(Product).filter(Product.id == list(item.keys())[0]).first()
        if product:
            products_info.append({"name": product.name, "qty": list(item.values())[0], "price": product.price})
    return {
        "order_id": order.id,
        "customer": {"name": order.customer_name, "phone": order.phone, "email": order.email,
                     "address": f"{order.address}, {order.district}, {order.state} - {order.pincode}"},
        "products": products_info,
        "total_price": order.total_price,
        "status": order.status,
        "date": order.created_at.isoformat()
    }

# ── Gallery endpoints ──────────────────────────────────────────────

@router.get("/gallery/")
def list_gallery():
    files = [f for f in os.listdir(GALLERY_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif'))]
    return [{"filename": f, "url": f"/admin/gallery/{f}"} for f in sorted(files)]

@router.get("/gallery/{filename}")
def get_gallery_image(filename: str):
    path = os.path.join(GALLERY_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(path)

@router.post("/gallery/upload", status_code=status.HTTP_201_CREATED)
def upload_gallery_image(file: UploadFile = File(...), current_admin = Depends(get_current_admin)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ('.jpg', '.jpeg', '.png', '.webp', '.gif'):
        raise HTTPException(status_code=400, detail="Invalid file type")
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(GALLERY_DIR, filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"filename": filename, "url": f"/admin/gallery/{filename}"}

@router.delete("/gallery/{filename}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gallery_image(filename: str, current_admin = Depends(get_current_admin)):
    path = os.path.join(GALLERY_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Image not found")
    os.remove(path)
    return None

# ── Product image upload ───────────────────────────────────────────

@router.post("/products/upload-image", status_code=status.HTTP_201_CREATED)
def upload_product_image(file: UploadFile = File(...), current_admin = Depends(get_current_admin)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ('.jpg', '.jpeg', '.png', '.webp'):
        raise HTTPException(status_code=400, detail="Invalid file type")
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(PRODUCT_IMG_DIR, filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"url": f"/admin/product-images/{filename}"}

@router.get("/product-images/{filename}")
def get_product_image(filename: str):
    path = os.path.join(PRODUCT_IMG_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(path)

# ── Email helpers ──────────────────────────────────────────────────

def build_bill_html(order, products_info):
    rows = "".join(
        f"""<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2a2010">{p['name']}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2a2010;text-align:center">{p.get('model_number') or '—'}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2a2010;text-align:center">{p['qty']}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2a2010;text-align:right">&#8377;{p['price']}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2a2010;text-align:right">&#8377;{p['price'] * p['qty']}</td>
        </tr>""" for p in products_info
    )
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#111;color:#f5f0e8;border:1px solid #3a3020;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#c8a84b,#f0d080);padding:24px 32px">
        <h1 style="margin:0;color:#111;font-size:22px">&#10003; Order Confirmed!</h1>
        <p style="margin:4px 0 0;color:#333;font-size:14px">Order #{order.id} &bull; {order.created_at.strftime('%d %b %Y')}</p>
      </div>
      <div style="padding:24px 32px">
        <p style="margin:0 0 16px">Hi <strong>{order.customer_name}</strong>, your order has been confirmed and is being processed.</p>
        <h3 style="color:#c8a84b;margin:0 0 12px">Delivery Address</h3>
        <p style="margin:0 0 20px;color:#b0a080">{order.address}, {order.district}, {order.state} — {order.pincode}<br>Phone: {order.phone}</p>
        <h3 style="color:#c8a84b;margin:0 0 12px">Order Summary</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#1e1a10">
              <th style="padding:10px 12px;text-align:left;color:#c8a84b">Product</th>
              <th style="padding:10px 12px;text-align:center;color:#c8a84b">Model</th>
              <th style="padding:10px 12px;text-align:center;color:#c8a84b">Qty</th>
              <th style="padding:10px 12px;text-align:right;color:#c8a84b">Price</th>
              <th style="padding:10px 12px;text-align:right;color:#c8a84b">Total</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
        <div style="text-align:right;margin-top:16px;padding-top:16px;border-top:2px solid #c8a84b">
          <span style="font-size:18px;font-weight:bold;color:#c8a84b">Grand Total: &#8377;{order.total_price}</span>
        </div>
      </div>
      <div style="background:#1e1a10;padding:16px 32px;text-align:center;font-size:12px;color:#7a6a50">
        Thank you for shopping with us! For queries, reply to this email.
      </div>
    </div>
    """

def send_confirmation_email(order, products_info):
    if not SMTP_USER or not SMTP_PASS:
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Order Confirmed — #{order.id} | E-Shop"
        msg["From"] = SMTP_USER
        msg["To"] = order.email
        msg.attach(MIMEText(build_bill_html(order, products_info), "html"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, order.email, msg.as_string())
    except Exception as e:
        print(f"Email send failed: {e}")

# ── Order confirm endpoint ─────────────────────────────────────────

@router.post("/orders/{order_id}/confirm")
def confirm_order(order_id: int, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = "processing"
    db.commit()
    db.refresh(order)
    products_info = []
    for item in (order.products or []):
        pid = int(list(item.keys())[0])
        qty = int(list(item.values())[0])
        product = db.query(Product).filter(Product.id == pid).first()
        if product:
            products_info.append({"name": product.name, "model_number": product.model_number, "qty": qty, "price": product.price})
    send_confirmation_email(order, products_info)
    return {"message": "Order confirmed and email sent", "order_id": order.id}
