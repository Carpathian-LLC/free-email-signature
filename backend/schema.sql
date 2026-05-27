-- ──────────────────────────────────────────────────────────────────────
-- Free Email Signature Generator - Database Schema
-- ──────────────────────────────────────────────────────────────────────
-- Auto-applied by backend on startup (see main.py _ensure_schema).
-- Manual apply: mysql -h ... -u ... -p < schema.sql
--
-- For at-rest encryption, configure MySQL keyring (keyring_file.so) and
-- add ENCRYPTION='Y' clauses below. Disabled by default so the schema
-- applies on servers without the keyring plugin loaded.
-- For TLS in transit, set DB_SSL_CA / DB_SSL_CERT / DB_SSL_KEY in env.
-- ──────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS db_emailgen
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE db_emailgen;

CREATE TABLE IF NOT EXISTS images (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    random_hash VARCHAR(12) NOT NULL,
    asset_hash VARCHAR(64) NOT NULL,
    content_type VARCHAR(50) NOT NULL DEFAULT 'image/png',
    file_size INT UNSIGNED NOT NULL DEFAULT 0,
    original_name VARCHAR(255) DEFAULT NULL,
    uploader_ip VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY idx_cos (random_hash, asset_hash),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
