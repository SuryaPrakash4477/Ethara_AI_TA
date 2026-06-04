from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, description="Product name")
    sku: str = Field(..., min_length=1, description="Unique SKU code")
    price: float = Field(..., ge=0, description="Price must be non-negative")
    quantity: int = Field(..., ge=0, description="Stock quantity must be non-negative")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    sku: Optional[str] = Field(None, min_length=1)
    price: Optional[float] = Field(None, ge=0)
    quantity: Optional[int] = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True

# --- Customer Schemas ---
class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, description="Full name")
    email: str = Field(..., min_length=3, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int

    class Config:
        from_attributes = True

# --- Order Item Schemas ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0, description="Ordered quantity must be greater than zero")

class OrderItemProductBrief(BaseModel):
    id: int
    name: str
    sku: str
    price: float

    class Config:
        from_attributes = True

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: Optional[OrderItemProductBrief] = None

    class Config:
        from_attributes = True

# --- Order Schemas ---
class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1, description="List of items in the order")

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    customer: CustomerResponse
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True
