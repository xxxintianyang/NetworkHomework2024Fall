DROP DATABASE IF EXISTS web_db_control;
CREATE DATABASE web_db_control
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE web_db_control;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (username, email) VALUES
    ('admin', 'admin@example.com'),
    ('test_user', 'test@example.com'),
    ('john_doe', 'john@example.com');

INSERT INTO products (name, price, stock, description) VALUES
    (N'笔记本电脑', 5999.99, 10, N'高性能笔记本电脑'),
    (N'智能手机', 2999.99, 20, N'新一代智能手机'),
    (N'无线耳机', 999.99, 50, N'蓝牙无线耳机'); 