-- =====================================================
-- Fuel Fashion Hub Database Schema
-- Part 1
-- Database + Users + Products
-- =====================================================

DROP DATABASE IF EXISTS fuel_fashion_hub;
CREATE DATABASE fuel_fashion_hub;

USE fuel_fashion_hub;

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    phone VARCHAR(15),

    role ENUM('customer','admin')
        DEFAULT 'customer',

    is_verified BOOLEAN
        DEFAULT FALSE,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCTS
-- =====================================================

CREATE TABLE sizes (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(20) NOT NULL UNIQUE

);

CREATE TABLE categories (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100)
    UNIQUE NOT NULL

);

CREATE TABLE products (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL,

    slug VARCHAR(255)
        NOT NULL UNIQUE,

    club VARCHAR(100)
        NOT NULL,

    league VARCHAR(100),

    season VARCHAR(20),

    category_id INT NOT NULL,

    condition_type ENUM(
        'new',
        'used'
    ) DEFAULT 'new',

    description TEXT,

    price DECIMAL(10,2)
        NOT NULL,

    discount_percent DECIMAL(5,2)
        DEFAULT 0.00,

    featured BOOLEAN
        DEFAULT FALSE,

    is_active BOOLEAN
        DEFAULT TRUE,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

    CONSTRAINT fk_category
        FOREIGN KEY(category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
);

-- =====================================================
-- PRODUCT IMAGES
-- One product can have multiple images
-- =====================================================

CREATE TABLE product_images (

    id INT AUTO_INCREMENT PRIMARY KEY,

    product_id INT NOT NULL,

    image_url VARCHAR(500)
        NOT NULL,

    display_order INT
        DEFAULT 1,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_image
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);

-- =====================================================
-- PRODUCT SIZES
-- Stores stock for every size
-- =====================================================

CREATE TABLE product_sizes (

    id INT AUTO_INCREMENT PRIMARY KEY,

    product_id INT NOT NULL,

    size_id INT NOT NULL,

    stock INT
        DEFAULT 0,

    CHECK (stock >= 0)

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_size
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_product_size
        UNIQUE(product_id, size_id)

    CONSTRAINT fk_size
        FOREIGN KEY(size_id)
        REFERENCES sizes(id)
        ON DELETE RESTRICT

);

CREATE TABLE inventory_logs (

    id INT AUTO_INCREMENT PRIMARY KEY,

    product_size_id INT NOT NULL,

    quantity_change INT NOT NULL,

    reason ENUM(
        'restock',
        'sale',
        'return',
        'damaged',
        'manual_adjustment'
    ) NOT NULL,

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_product_size

    FOREIGN KEY(product_size_id)

    REFERENCES product_sizes(id)

    ON DELETE CASCADE

);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_product_name
ON products(name);

CREATE INDEX idx_product_club
ON products(club);

CREATE INDEX idx_product_league
ON products(league);

CREATE INDEX idx_product_category
ON products(category);

CREATE INDEX idx_product_price
ON products(price);

CREATE INDEX idx_product_featured
ON products(featured);

CREATE INDEX idx_product_active
ON products(is_active);

CREATE INDEX idx_user_email
ON users(email);

-- =====================================================
-- CART
-- =====================================================

CREATE TABLE cart (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================================
-- CART ITEMS
-- =====================================================

CREATE TABLE cart_items (

    id INT AUTO_INCREMENT PRIMARY KEY,

    cart_id INT NOT NULL,

    product_id INT NOT NULL,

    size_id INT NOT NULL,

    quantity INT NOT NULL DEFAULT 1,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CHECK(quantity > 0),

    CONSTRAINT fk_cartitem_cart
        FOREIGN KEY(cart_id)
        REFERENCES cart(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cartitem_product
        FOREIGN KEY(product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_cart_product_size
        UNIQUE(cart_id, product_id, size_id)

    CONSTRAINT fk_cart_size
        FOREIGN KEY(size_id)
        REFERENCES sizes(id)
);

-- =====================================================
-- WISHLIST
-- =====================================================

CREATE TABLE wishlist (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlist_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================================
-- WISHLIST ITEMS
-- =====================================================

CREATE TABLE wishlist_items (

    id INT AUTO_INCREMENT PRIMARY KEY,

    wishlist_id INT NOT NULL,

    product_id INT NOT NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlistitem_wishlist
        FOREIGN KEY(wishlist_id)
        REFERENCES wishlist(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_wishlistitem_product
        FOREIGN KEY(product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_wishlist_product
        UNIQUE(wishlist_id, product_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_cart_user
ON cart(user_id);

CREATE INDEX idx_cart_items_cart
ON cart_items(cart_id);

CREATE INDEX idx_cart_items_product
ON cart_items(product_id);

CREATE INDEX idx_wishlist_user
ON wishlist(user_id);

CREATE INDEX idx_wishlist_items_wishlist
ON wishlist_items(wishlist_id);

CREATE INDEX idx_wishlist_items_product
ON wishlist_items(product_id);

-- =====================================================
-- ADDRESSES
-- =====================================================

CREATE TABLE addresses (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    full_name VARCHAR(100) NOT NULL,

    phone VARCHAR(15) NOT NULL,

    address_line1 VARCHAR(255) NOT NULL,

    address_line2 VARCHAR(255),

    city VARCHAR(100) NOT NULL,

    state VARCHAR(100) NOT NULL,

    postal_code VARCHAR(20) NOT NULL,

    country VARCHAR(100)
        DEFAULT 'India',

    is_default BOOLEAN
        DEFAULT FALSE,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_address_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================================
-- ORDERS
-- =====================================================

CREATE TABLE orders (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    address_id INT NOT NULL,

    order_status ENUM(
        'pending',
        'confirmed',
        'shipped',
        'delivered',
        'cancelled'
    ) DEFAULT 'pending',

    payment_status ENUM(
        'pending',
        'paid',
        'failed',
        'refunded'
    ) DEFAULT 'pending',

    subtotal DECIMAL(10,2) NOT NULL,

    shipping_charge DECIMAL(10,2)
        DEFAULT 0,

    discount DECIMAL(10,2)
        DEFAULT 0,

    total_amount DECIMAL(10,2)
        NOT NULL,

    payment_method ENUM(
        'COD',
        'UPI',
        'Razorpay',
        'Stripe'
        )

    transaction_id VARCHAR(255),

    ordered_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_user
        FOREIGN KEY(user_id)
        REFERENCES users(id),

    CONSTRAINT fk_order_address
        FOREIGN KEY(address_id)
        REFERENCES addresses(id)
);

-- =====================================================
-- ORDER ITEMS
-- Product snapshot
-- =====================================================

CREATE TABLE order_items (

    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    product_id INT NOT NULL,

    product_name VARCHAR(255) NOT NULL,

    product_image VARCHAR(500),

    size_name VARCHAR(20)

    quantity INT NOT NULL,

    unit_price DECIMAL(10,2) NOT NULL,

    total_price DECIMAL(10,2) NOT NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CHECK(quantity > 0),

    CHECK(unit_price >= 0),

    CHECK(total_price >= 0),

    CONSTRAINT fk_orderitem_order
        FOREIGN KEY(order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_orderitem_product
        FOREIGN KEY(product_id)
        REFERENCES products(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_address_user
ON addresses(user_id);

CREATE INDEX idx_order_user
ON orders(user_id);

CREATE INDEX idx_order_status
ON orders(order_status);

CREATE INDEX idx_payment_status
ON orders(payment_status);

CREATE INDEX idx_order_items_order
ON order_items(order_id);

CREATE INDEX idx_order_items_product
ON order_items(product_id);

-- =====================================================
-- ADDITIONAL CHECK CONSTRAINTS
-- =====================================================

ALTER TABLE products
ADD CONSTRAINT chk_product_price
CHECK (price >= 0);

ALTER TABLE products
ADD CONSTRAINT chk_discount
CHECK (
    discount_percent >= 0
    AND
    discount_percent <= 100
);

ALTER TABLE product_sizes
ADD CONSTRAINT chk_stock
CHECK (stock >= 0);

ALTER TABLE orders
ADD CONSTRAINT chk_subtotal
CHECK (subtotal >= 0);

ALTER TABLE orders
ADD CONSTRAINT chk_shipping
CHECK (shipping_charge >= 0);

ALTER TABLE orders
ADD CONSTRAINT chk_discount_amount
CHECK (discount >= 0);

ALTER TABLE orders
ADD CONSTRAINT chk_total
CHECK (total_amount >= 0);

-- =====================================================
-- ADDITIONAL INDEXES
-- =====================================================

CREATE UNIQUE INDEX idx_product_slug
ON products(slug);

CREATE INDEX idx_product_created
ON products(created_at);

CREATE INDEX idx_product_updated
ON products(updated_at);

CREATE INDEX idx_product_size_stock
ON product_sizes(product_id, stock);

CREATE INDEX idx_orders_date
ON orders(ordered_at);

CREATE INDEX idx_orders_user_date
ON orders(user_id, ordered_at);

CREATE INDEX idx_addresses_default
ON addresses(user_id, is_default);

-- =====================================================
-- VERIFICATION
-- =====================================================

SHOW TABLES;

DESCRIBE users;

DESCRIBE products;

DESCRIBE product_images;

DESCRIBE product_sizes;

DESCRIBE cart;

DESCRIBE cart_items;

DESCRIBE wishlist;

DESCRIBE wishlist_items;

DESCRIBE addresses;

DESCRIBE orders;

DESCRIBE order_items;