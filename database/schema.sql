-- ==========================================================
-- Fuel Fashion Hub Database Schema
-- MySQL 8+
-- ==========================================================

DROP DATABASE IF EXISTS fuel_fashion_hub;

CREATE DATABASE fuel_fashion_hub;

USE fuel_fashion_hub;

-- ==========================================================
-- USERS
-- ==========================================================

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

-- ==========================================================
-- SIZES
-- ==========================================================

CREATE TABLE sizes (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(20)
        NOT NULL UNIQUE

);

-- ==========================================================
-- CATEGORIES
-- ==========================================================

CREATE TABLE categories (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100)
        NOT NULL UNIQUE

);

-- ==========================================================
-- PRODUCTS
-- ==========================================================

CREATE TABLE products (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255)
        NOT NULL,

    slug VARCHAR(255)
        NOT NULL UNIQUE,

    club VARCHAR(100)
        NOT NULL,

    league VARCHAR(100),

    season VARCHAR(20),

    category_id INT
        NOT NULL,

    condition_type ENUM(
        'new',
        'used'
    ) DEFAULT 'new',

    description TEXT,

    price DECIMAL(10,2)
        NOT NULL,

    discount_percent DECIMAL(5,2)
        DEFAULT 0,

    featured BOOLEAN
        DEFAULT FALSE,

    is_active BOOLEAN
        DEFAULT TRUE,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_price
        CHECK(price >= 0),

    CONSTRAINT chk_discount
        CHECK(discount_percent >= 0
            AND discount_percent <= 100),

    CONSTRAINT fk_product_category
        FOREIGN KEY(category_id)

        REFERENCES categories(id)

        ON DELETE RESTRICT

);

-- ==========================================================
-- PRODUCT IMAGES
-- ==========================================================

CREATE TABLE product_images (

    id INT AUTO_INCREMENT PRIMARY KEY,

    product_id INT NOT NULL,

    image_url VARCHAR(500) NOT NULL,

    display_order INT DEFAULT 1,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE

);

-- ==========================================================
-- PRODUCT SIZES
-- ==========================================================

CREATE TABLE product_sizes (

    id INT AUTO_INCREMENT PRIMARY KEY,

    product_id INT NOT NULL,

    size_id INT NOT NULL,

    stock INT NOT NULL DEFAULT 0,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_stock
        CHECK (stock >= 0),

    CONSTRAINT fk_product_sizes_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_product_sizes_size
        FOREIGN KEY (size_id)
        REFERENCES sizes(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_product_size
        UNIQUE (product_id, size_id)

);

-- ==========================================================
-- INVENTORY LOGS
-- ==========================================================

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

    remarks VARCHAR(255),

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_product_size
        FOREIGN KEY (product_size_id)
        REFERENCES product_sizes(id)
        ON DELETE CASCADE

);

-- ==========================================================
-- CART
-- ==========================================================

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

-- ==========================================================
-- CART ITEMS
-- ==========================================================

CREATE TABLE cart_items (

    id INT AUTO_INCREMENT PRIMARY KEY,

    cart_id INT NOT NULL,

    product_id INT NOT NULL,

    size_id INT NOT NULL,

    quantity INT NOT NULL DEFAULT 1,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_cart_quantity
        CHECK(quantity > 0),

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id)
        REFERENCES cart(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cart_items_size
        FOREIGN KEY (size_id)
        REFERENCES sizes(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_cart_item
        UNIQUE(cart_id, product_id, size_id)

);

-- ==========================================================
-- WISHLIST
-- ==========================================================

CREATE TABLE wishlist (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlist_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

);

-- ==========================================================
-- WISHLIST ITEMS
-- ==========================================================

CREATE TABLE wishlist_items (

    id INT AUTO_INCREMENT PRIMARY KEY,

    wishlist_id INT NOT NULL,

    product_id INT NOT NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlist_items_wishlist
        FOREIGN KEY (wishlist_id)
        REFERENCES wishlist(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_wishlist_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_wishlist_item
        UNIQUE(wishlist_id, product_id)

);

-- ==========================================================
-- ADDRESSES
-- ==========================================================

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

    country VARCHAR(100) DEFAULT 'India',

    is_default BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_addresses_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

);

-- ==========================================================
-- ORDERS
-- ==========================================================

CREATE TABLE orders (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

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

    payment_method ENUM(
        'COD',
        'UPI',
        'Razorpay',
        'Stripe'
    ) NOT NULL,

    subtotal DECIMAL(10,2) NOT NULL,

    shipping_charge DECIMAL(10,2) DEFAULT 0,

    discount DECIMAL(10,2) DEFAULT 0,

    total_amount DECIMAL(10,2) NOT NULL,

    transaction_id VARCHAR(255),

    -- Shipping Address Snapshot

    full_name VARCHAR(100) NOT NULL,

    phone VARCHAR(15) NOT NULL,

    address_line1 VARCHAR(255) NOT NULL,

    address_line2 VARCHAR(255),

    city VARCHAR(100) NOT NULL,

    state VARCHAR(100) NOT NULL,

    postal_code VARCHAR(20) NOT NULL,

    country VARCHAR(100) NOT NULL,

    ordered_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_order_subtotal
        CHECK(subtotal >= 0),

    CONSTRAINT chk_order_shipping
        CHECK(shipping_charge >= 0),

    CONSTRAINT chk_order_discount
        CHECK(discount >= 0),

    CONSTRAINT chk_order_total
        CHECK(total_amount >= 0),

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)

);

-- ==========================================================
-- ORDER ITEMS
-- ==========================================================

CREATE TABLE order_items (

    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    product_id INT NOT NULL,

    product_name VARCHAR(255) NOT NULL,

    product_image VARCHAR(500),

    club VARCHAR(100),

    category_name VARCHAR(100),

    size_name VARCHAR(20) NOT NULL,

    quantity INT NOT NULL,

    unit_price DECIMAL(10,2) NOT NULL,

    total_price DECIMAL(10,2) NOT NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_order_item_quantity
        CHECK(quantity > 0),

    CONSTRAINT chk_order_item_price
        CHECK(unit_price >= 0),

    CONSTRAINT chk_order_item_total
        CHECK(total_price >= 0),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)

);