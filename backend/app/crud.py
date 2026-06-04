from sqlalchemy.orm import Session
from . import models, schemas

# --- Products ---
def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session):
    return db.query(models.Product).all()

def create_product(db: Session, product: schemas.ProductCreate):
    existing_product = get_product_by_sku(db, sku=product.sku)
    if existing_product:
        raise ValueError(f"Product with SKU '{product.sku}' already exists.")
    
    db_product = models.Product(
        name=product.name,
        sku=product.sku,
        price=product.price,
        quantity=product.quantity
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    update_data = product_update.model_dump(exclude_unset=True)
    if "sku" in update_data and update_data["sku"] != db_product.sku:
        existing = get_product_by_sku(db, sku=update_data["sku"])
        if existing:
            raise ValueError(f"Product with SKU '{update_data['sku']}' already exists.")
            
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    db.delete(db_product)
    db.commit()
    return db_product

# --- Customers ---
def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def get_customers(db: Session):
    return db.query(models.Customer).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    existing_customer = get_customer_by_email(db, email=customer.email)
    if existing_customer:
        raise ValueError(f"Customer with email '{customer.email}' already exists.")
        
    db_customer = models.Customer(
        name=customer.name,
        email=customer.email,
        phone=customer.phone
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return None
    db.delete(db_customer)
    db.commit()
    return db_customer

# --- Orders ---
def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session):
    return db.query(models.Order).all()

def create_order(db: Session, order_in: schemas.OrderCreate):
    # 1. Verify Customer exists
    customer = get_customer(db, order_in.customer_id)
    if not customer:
        raise ValueError(f"Customer with ID {order_in.customer_id} does not exist.")
        
    try:
        total_amount = 0.0
        order_items = []
        
        # 2. Process each item and adjust stock
        for item in order_in.items:
            product = get_product(db, item.product_id)
            if not product:
                raise ValueError(f"Product with ID {item.product_id} does not exist.")
                
            # Verify inventory
            if product.quantity < item.quantity:
                raise ValueError(
                    f"Insufficient stock for product '{product.name}'. "
                    f"In stock: {product.quantity}, requested: {item.quantity}."
                )
                
            # Deduct stock
            product.quantity -= item.quantity
            
            # Calculate item total based on current price
            total_amount += product.price * item.quantity
            
            # Create OrderItem object (associated with order items)
            db_item = models.OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price=product.price
            )
            order_items.append(db_item)
            
        # Create Order
        db_order = models.Order(
            customer_id=order_in.customer_id,
            total_amount=total_amount,
            items=order_items
        )
        
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order
    except Exception as e:
        db.rollback()
        raise e

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if not db_order:
        return None
        
    try:
        # Restore stock for each product in the deleted order
        for item in db_order.items:
            product = get_product(db, item.product_id)
            if product:
                product.quantity += item.quantity
        db.delete(db_order)
        db.commit()
        return db_order
    except Exception as e:
        db.rollback()
        raise e
