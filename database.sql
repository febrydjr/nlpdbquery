
-- Sample database schema for Natural Query Explorer
-- This script creates tables for an e-commerce database

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    parent_id INTEGER REFERENCES categories(id)
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER NOT NULL REFERENCES categories(id)
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Sample data insertion
-- Users
INSERT INTO users (username, email, created_at, last_login)
VALUES 
    ('johndoe', 'john@example.com', '2023-01-15 10:30:00', '2023-05-18 14:20:00'),
    ('janedoe', 'jane@example.com', '2023-02-20 09:15:00', '2023-05-17 11:45:00'),
    ('bobsmith', 'bob@example.com', '2023-03-10 15:40:00', '2023-05-19 08:30:00');

-- Categories
INSERT INTO categories (name, parent_id)
VALUES 
    ('Electronics', NULL),
    ('Audio', 1),
    ('Computers', 1),
    ('Clothing', NULL),
    ('Men''s', 4),
    ('Women''s', 4);

-- Products
INSERT INTO products (name, description, price, stock, category_id)
VALUES 
    ('Laptop Pro', 'High-performance laptop', 1299.99, 15, 3),
    ('Smartphone X', 'Latest smartphone model', 799.99, 8, 1),
    ('Wireless Headphones', 'Noise-cancelling headphones', 199.99, 25, 2),
    ('Smart Watch', 'Health and fitness tracker', 249.99, 5, 1),
    ('Cotton T-Shirt', 'Comfortable everyday t-shirt', 19.99, 50, 5),
    ('Designer Jeans', 'Premium denim jeans', 89.99, 30, 6);

-- Orders
INSERT INTO orders (user_id, status, total_amount, created_at)
VALUES 
    (1, 'completed', 2549.97, '2023-04-10 13:45:00'),
    (2, 'processing', 1099.98, '2023-05-05 11:20:00'),
    (3, 'completed', 3299.96, '2023-05-01 09:30:00');

-- Order Items
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES 
    (1, 1, 1, 1299.99),
    (1, 3, 5, 199.99),
    (1, 4, 2, 249.99),
    (2, 2, 1, 799.99),
    (2, 5, 15, 19.99),
    (3, 1, 2, 1299.99),
    (3, 4, 2, 249.99),
    (3, 6, 2, 89.99);

-- Create indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
