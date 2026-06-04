from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .routers import products, customers, orders
from . import models

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB Tables on startup
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed the database if it is empty for ease of evaluation
    db = SessionLocal()
    try:
        if db.query(models.Product).count() == 0:
            products_seed = [
                models.Product(name="Ergonomic Mechanical Keyboard", sku="KB-MECH-01", price=129.99, quantity=25),
                models.Product(name="UltraWide Gaming Monitor 34\"", sku="MON-UW-34", price=449.99, quantity=8),
                models.Product(name="Wireless Noise-Canceling Headphones", sku="HP-WNC-02", price=199.99, quantity=15),
                models.Product(name="Ergonomic Office Chair", sku="CHR-ERG-03", price=299.99, quantity=3),  # Low Stock!
                models.Product(name="USB-C Dual HDMI Docking Station", sku="DK-USBC-04", price=89.99, quantity=0)     # Out of Stock!
            ]
            db.add_all(products_seed)
            db.commit()
            
        if db.query(models.Customer).count() == 0:
            customers_seed = [
                models.Customer(name="John Doe", email="john.doe@example.com", phone="+1 (555) 019-2834"),
                models.Customer(name="Jane Smith", email="jane.smith@example.com", phone="+1 (555) 014-9876"),
                models.Customer(name="Alice Johnson", email="alice.j@example.com", phone="+1 (555) 012-3456")
            ]
            db.add_all(customers_seed)
            db.commit()
            
        if db.query(models.Order).count() == 0:
            cust = db.query(models.Customer).filter_by(email="john.doe@example.com").first()
            p1 = db.query(models.Product).filter_by(sku="KB-MECH-01").first()
            p2 = db.query(models.Product).filter_by(sku="HP-WNC-02").first()
            
            if cust and p1 and p2:
                # Deduct stock for seeding
                p1.quantity -= 1
                p2.quantity -= 2
                
                order_items = [
                    models.OrderItem(product_id=p1.id, quantity=1, price=p1.price),
                    models.OrderItem(product_id=p2.id, quantity=2, price=p2.price)
                ]
                
                total = (p1.price * 1) + (p2.price * 2)
                order = models.Order(customer_id=cust.id, total_amount=total, items=order_items)
                db.add(order)
                db.commit()
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()
        
    yield

app = FastAPI(
    title="Inventory & Order Management API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS: credentials must be False when using wildcard origins (browser blocks * + credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Inventory & Order Management API",
        "docs_url": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}

# Include all API endpoints
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
